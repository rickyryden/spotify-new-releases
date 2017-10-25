import React from 'react';

export default class Album extends React.Component {
	render() {
		if (this.props.album) {
			return (
				<div>
					Senaste albumet:
					<img src={this.props.album.images[1].url} />
					<strong>{this.props.album.name}</strong>
				</div>
			);
		} else {
			return null;
		}
	}
}
