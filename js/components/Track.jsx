import React from 'react';

export default class Track extends React.Component {
	render() {
		if (this.props.data) {
			return (
				<a href={this.props.data.uri} className="track">
					{this.props.data.artists[0].name} - {this.props.data.name}
				</a>
			);
		}

		return null;
	}
}
