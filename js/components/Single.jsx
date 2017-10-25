import React from 'react';

export default class Single extends React.Component {
	render() {
		if (this.props.single) {
			return (
				<div>
					Senaste singeln:
					<img src={this.props.single.images[1].url} />
					<strong>{this.props.single.name}</strong>
				</div>
			);
		} else {
			return null;
		}
	}
}
