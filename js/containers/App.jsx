import React from 'react';
import delay from 'await-delay';

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
			loopedArtists: 0,
			songs: [],
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

				if (response.data.artists.cursors.after) {
					this.fetchArtists();
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}
	async fetchAlbums() {
		let loopedArtists = 0;

		let fetchAndSaveAlbumData = (albumId) => {
			axios.get('albums/' + albumId + '/tracks')
				.then((response) => {
					let albums = this.state.albums;
					albums.push(response.data);
					this.setState({
						albums: albums,
					});
				})
				.catch((error) => {
					console.log(error);
				});
		}

		let fetchAlbum = (artist) => {
			axios.get('artists/' + artist.id + '/albums?limit=50&album_type=album,single')
				.then((response) => {
					let albumFetched = false;
					let singleFetched = false;
					response.data.items.map((album) => {
						if ( ! albumFetched && album.album_type === 'album') {
							albumFetched = true;
							fetchAndSaveAlbumData(album.id);
						}

						if ( ! singleFetched && album.album_type === 'single') {
							singleFetched = true;
							fetchAndSaveAlbumData(album.id);
						}
					});

					loopedArtists++;
					this.setState({
						loopedArtists: loopedArtists,
					});
				})
				.catch((error) => {
					console.log(error);
				});
		}

		let artists = this.state.artists;
		for (let i in artists) {
			await fetchAlbum(artists[i]);
			await delay(300);
		}
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
		let loginButton = null;
		if ( ! this.state.access_token) {
			loginButton = <div><a href="#" onClick={(event) => this.login(event)}>Login</a></div>;
		}

		let removeToken = null;
		if (this.state.access_token) {
			removeToken = <div><a href="#" onClick={(event) => this.removeToken(event)}>Remove token</a></div>;
		}

		let albums = 'Loading...';
		albums = this.state.albums.map((album) => {
			if ( ! album) {
				return;
			}

			return (
				<Cover key={album.id} data={album} />
			);
		});

		let fetchButton = null;
		if (this.state.access_token) {
			fetchButton = <div><a href="#" onClick={(event) => { event.preventDefault(); this.fetchAlbums(); }}>Fetch albums</a></div>;
		}

		return (
			<div className="flex">
				<div className="navigation">
					<div>Fetched albums: {this.state.loopedArtists + '/' + this.state.artists.length}</div>
					{fetchButton}
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
