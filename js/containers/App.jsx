import React from 'react';

import Album from '../components/Album';
import Single from '../components/Single';

export default class Layout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			album: null,
			single: null,
			artists: [],
			allArtists: [],
			after: null,
			currentArtist: null,
			access_token: null,
			client_id: '88e7f2f559d94ecbb17f94a5a8559f4c',
			redirect_uri: window.location.href,
			scopes: 'user-follow-read',
		};
	}
	componentWillMount() {
		if (localStorage.getItem('access_token')) {
			this.setState({
				access_token: localStorage.getItem('access_token'),
			});

			axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.getItem('access_token');

			axios.get('me/following?type=artist')
				.then((response) => {
					this.setState({
						artists: response.data.artists.items,
						allArtists: this.state.allArtists.concat(response.data.artists.items),
						after: response.data.artists.cursors.after,
					});
				})
				.catch((error) => {
					console.log(error);
				});
		}

		let hash = window.location.hash;

		if (hash) {
			let values = hash.split('&');
			let access_token = values[0];
			access_token = access_token.replace('#access_token=', '');

			if (access_token) {
				localStorage.setItem('access_token', access_token);
				axios.defaults.headers.common.Authorization = 'Bearer ' + access_token;

				axios.get('me/following?type=artist')
					.then((response) => {
						window.location.href = '/';
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	}
	nextPage(event) {
		event.preventDefault();

		axios.get('me/following?type=artist&after=' + this.state.after)
			.then((response) => {
				this.setState({
					artists: response.data.artists.items,
					allArtists: this.state.allArtists.concat(response.data.artists.items),
					after: response.data.artists.cursors.after,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
	getLatest(event, artist) {
		event.preventDefault();

		let artistId = artist.id;
		let artistName = artist.name;

		this.setState({
			currentArtist: artistName,
		});

		axios.get('artists/' + artistId + '/albums?limit=1&album_type=album')
			.then((response) => {
				this.setState({
					album: response.data.items[0],
				});
			})
			.catch((error) => {
				console.log(error);
			});

		axios.get('artists/' + artistId + '/albums?limit=1&album_type=single')
			.then((response) => {
				this.setState({
					single: response.data.items[0],
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
	login(event) {
		event.preventDefault();
		window.location.href = 'https://accounts.spotify.com/authorize?client_id=' + this.state.client_id + '&response_type=token&redirect_uri=' + this.state.redirect_uri + '&scope=' + this.state.scopes;
	}
	removeToken(event) {
		event.preventDefault();
		localStorage.removeItem('access_token');
		window.location.href = '/';
	}
	render() {
		let artists = 'Laddar...';
		artists = this.state.artists.map((artist) => {
			return (
				<div key={artist.id}>
					<a href="#" onClick={(event) => this.getLatest(event, artist)}>{artist.name}</a>
				</div>
			);
		});

		let currentArtist = null;
		if (this.state.currentArtist) {
			currentArtist = <h1>{this.state.currentArtist}</h1>;
		}

		let loginButton = null;
		if ( ! this.state.access_token) {
			loginButton = <div><a href="#" onClick={(event) => this.login(event)}>Logga in</a></div>;
		}

		let nextButton = null;
		if (this.state.access_token) {
			nextButton = <a href="#" onClick={(event) => this.nextPage(event)}>Nästa sida »</a>
		}

		let removeToken = null;
		if (this.state.access_token) {
			removeToken = <div><a href="#" onClick={(event) => this.removeToken(event)}>Ta bort token</a></div>;
		}

		return (
			<div className="flex">
				<div className="list">
					<strong>Artister du följer:</strong>
					{artists}
					{nextButton}
					{loginButton}
					{removeToken}
				</div>
				<div className="current">
					{currentArtist}

					<div className="covers">
						<Album album={this.state.album} />
						<Single single={this.state.single} />
					</div>
				</div>
			</div>
		);
	}
}
