import {
React,
Text,
View,
PropTypes
} from '../../comp-libraries';
import styles from './styles';

const __DONT_CHANGE_ME__ = ({ title, style }) => (
    <View style={[styles.container, style]}>
        <Text>{title}</Text>
    </View>
);

__DONT_CHANGE_ME__.propTypes = {
    title: PropTypes.string,
    style: PropTypes.object
};

__DONT_CHANGE_ME__.defaultProps = {
    title: 'Default Functional Component'
};

export default React.memo(__DONT_CHANGE_ME__);
