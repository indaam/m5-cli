import { Button, Text } from 'components';
import { ACTION_TYPES } from 'config/redux/actions';
import {
    Component,
    PropTypes,
    React,
    ScrollView,
    View,
    withSafeArea
} from 'libraries';

import _ from 'lodash';
import { FlatList } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

class __DONT_CHANGE_ME__ extends Component {
    componentDidMount = () => {
        // console.log('props => mounted =>', this.props);
    };

    componentDidUpdate = (prevProps, prevState) => {
        // console.log('props => did update =>', this.props);
    };

    _renderLists = ({ item }) => (
        <View>
            <Text>{item.name}</Text>
        </View>
    );

    render() {
        const { onRequestApi, swPerson } = this.props;
        return (
            <ScrollView>
                <View style={{ padding: 10 }}>
                    <Text h1>Text</Text>
                </View>
            </ScrollView>
        );
    }
}

__DONT_CHANGE_ME__.propTypes = {
    onRequestApi: PropTypes.func,
    swPerson: PropTypes.object
};

const wrappedComponent = withSafeArea()(__DONT_CHANGE_ME__);

/** ---------- REDUX CONNECTION ---------- */
const mapStateToProps = state => ({
    swPerson: {
        isLoading: _.get(state.swPersonReducer, 'fetching', false),
        data: _.get(state.swPersonReducer, 'data.results', [])
    }
});
const mapDispatchToProps = dispatch => ({
    onRequestApi: () => dispatch({ type: ACTION_TYPES.SWPERSON_REQUEST })
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(wrappedComponent);
