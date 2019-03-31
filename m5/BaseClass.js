import { React, Text, View, PropTypes, Component } from 'libraries';
import styles from './styles';

class __DONT_CHANGE_ME__ extends Component {
    // state = {};
    // componentDidMount() {}
    // yourFunction = () => {};

    render() {
        const { title, style } = this.props;
        return (
            <View style={[styles.container, style]}>
                <Text>{title}</Text>
            </View>
        );
    }
}

__DONT_CHANGE_ME__.propTypes = {
    title: PropTypes.string,
    style: PropTypes.object
};

__DONT_CHANGE_ME__.defaultProps = {
    title: 'Default Class Component'
};

export default __DONT_CHANGE_ME__;
