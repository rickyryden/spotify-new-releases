import React from 'react';

import Album from '../components/Album';
import Cover from '../components/Cover';
import Single from '../components/Single';

export default class Layout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			albums: [],
			singles: [],
			artists: [],
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
			this.fetchArtists();
		}

		let hash = window.location.hash;

		if (hash) {
			let values = hash.split('&');
			let access_token = values[0];
			access_token = access_token.replace('#access_token=', '');

			if (access_token) {
				localStorage.setItem('access_token', access_token);
				window.location.href = '/';
			}
		}
	}
	fetchArtists() {
		let afterCursor = '';

		if (this.state.after) {
			afterCursor = '&after=' + this.state.after;
		}

		axios.get('me/following?type=artist&limit=50' + afterCursor)
			.then((response) => {
				this.setState({
					artists: this.state.artists.concat(response.data.artists.items),
					after: response.data.artists.cursors.after,
				});

				// if (response.data.artists.cursors.after) {
				// 	this.fetchArtists();
				// } else {
					this.fetchAlbums();
				// }
			})
			.catch((error) => {
				console.log(error);
			});
	}
	fetchAlbums() {
		let fetchAlbum = (artist) => {
			axios.get('artists/' + artist.id + '/albums?limit=1&album_type=single')
				.then((response) => {
					let albums = this.state.albums;
					albums.push(response.data.items[0]);
					this.setState({
						albums: albums,
					});
				})
				.catch((error) => {
					console.log(error);
				});
		}
		this.state.artists.map((artist) => {
			fetchAlbum(artist);
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
					{artist.name}
				</div>
			);
		});

		let loginButton = null;
		if ( ! this.state.access_token) {
			loginButton = <div><a href="#" onClick={(event) => this.login(event)}>Logga in</a></div>;
		}

		let removeToken = null;
		if (this.state.access_token) {
			removeToken = <div><br /><br /><a href="#" onClick={(event) => this.removeToken(event)}>Ta bort token</a></div>;
		}

		let albums = 'Laddar...';
		if (this.state.albums.length === this.state.artists.length) {
			albums = this.state.albums.map((album) => {
				if ( ! album) {
					return;
				}

				return (
					<Cover key={album.id} data={album} />
				);
			});
		}

		return (
			<div className="flex">
				<div className="list">
					<strong>Artister du följer:</strong>
					{artists}
					{loginButton}
					{removeToken}
				</div>
				<div className="covers">
					{albums}
				</div>
			</div>
		);
	}
}
