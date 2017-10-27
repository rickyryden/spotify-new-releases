import React from 'react';

export default class Cover extends React.Component {
	render() {
		if (this.props.data) {
			return (
				<a href={this.props.data.uri} className="cover">
					<img
						src={this.props.data.images[1].url}
						alt={this.props.data.artists[0].name + ' - ' + this.props.data.name}
						title={this.props.data.artists[0].name + ' - ' + this.props.data.name}
					/>
				</a>
			);
		}

		return null;
	}
}
