import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { Dimensions, View, TouchableOpacity, Text } from 'react-native';
import addons from '@storybook/addons';
import Events from '@storybook/core-events';
import style from './style';
import StoryListView from '../StoryListView';
import StoryView from '../StoryView';
import AddonsList from './addons/list';
import AddonWrapper from './addons/wrapper';

/**
 * Returns true if the screen is in portrait mode
 */
const isDeviceInPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

const DRAWER_WIDTH = 250;

export default class OnDeviceUI extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isUIVisible: props.isUIOpen,
      isMenuOpen: props.isStoryMenuOpen,
      selectedKind: null,
      selectedStory: null,
      isPortrait: isDeviceInPortrait(),
      addonSelected: null,
      addonVisible: false,
    };

    addons.loadAddons();

    this.panels = addons.getPanels();
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this.handleDeviceRotation);
    this.props.events.on(Events.SELECT_STORY, this.handleStoryChange);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleDeviceRotation);
    this.props.events.removeListener(Events.SELECT_STORY, this.handleStoryChange);
  }

  handleCloseAddons = () => {
    this.setState({
      addonVisible: false,
    });
  };

  handlePressAddon = id => {
    this.setState({
      addonVisible: true,
      addonSelected: id,
    });
  };

  handleDeviceRotation = () => {
    this.setState({
      isPortrait: isDeviceInPortrait(),
    });
  };

  handleStoryChange = selection => {
    const { kind, story } = selection;
    this.setState({
      selectedKind: kind,
      selectedStory: story,
    });
  };

  handleToggleMenu = () => {
    this.setState({
      isMenuOpen: !this.state.isMenuOpen,
    });
  };

  handleToggleUI = () => {
    this.setState({
      isUIVisible: !this.state.isUIVisible,
    });
  };

  renderVisibilityButton = () => (
    <TouchableOpacity
      onPress={this.handleToggleUI}
      testID="Storybook.OnDeviceUI.toggleUI"
      accessibilityLabel="Storybook.OnDeviceUI.toggleUI"
      style={style.hideButton}
    >
      <Text style={style.text}>o</Text>
    </TouchableOpacity>
  );

  render() {
    const { stories, events, url } = this.props;
    const { isPortrait, isMenuOpen, selectedKind, selectedStory, isUIVisible } = this.state;

    const iPhoneXStyles = ifIphoneX(
      isPortrait
        ? {
            marginVertical: 30,
          }
        : {
            marginHorizontal: 30,
          },
      {}
    );

    const menuStyles = [
      style.menuContainer,
      {
        transform: [
          {
            translateX: isMenuOpen ? 0 : -DRAWER_WIDTH - 30,
          },
        ],
      },
      iPhoneXStyles,
    ];

    const headerStyles = [style.headerContainer, !isUIVisible && style.invisible];

    const previewContainerStyles = [style.previewContainer, iPhoneXStyles];

    const previewWrapperStyles = [style.previewWrapper, iPhoneXStyles];

    return (
      <View style={style.main}>
        <View style={previewContainerStyles}>
          <View style={headerStyles}>
            <TouchableOpacity
              onPress={this.handleToggleMenu}
              testID="Storybook.OnDeviceUI.open"
              accessibilityLabel="Storybook.OnDeviceUI.open"
            >
              <View>
                <Text style={style.text}>≡</Text>
              </View>
            </TouchableOpacity>

            <AddonsList onPressAddon={this.handlePressAddon} panels={this.panels} />
            {this.renderVisibilityButton()}
          </View>
          <View style={previewWrapperStyles}>
            <View style={style.preview}>
              <StoryView url={url} events={events} />
            </View>
          </View>
          {!isUIVisible ? this.renderVisibilityButton() : null}
        </View>
        <View style={menuStyles}>
          <TouchableOpacity
            onPress={this.handleToggleMenu}
            testID="Storybook.OnDeviceUI.close"
            accessibilityLabel="Storybook.OnDeviceUI.close"
          >
            <View>
              <Text style={style.closeButton}>x</Text>
            </View>
          </TouchableOpacity>
          <StoryListView
            stories={stories}
            events={events}
            width={DRAWER_WIDTH}
            selectedKind={selectedKind}
            selectedStory={selectedStory}
          />
        </View>
        <AddonWrapper
          visible={this.state.addonVisible}
          onClose={this.handleCloseAddons}
          addonSelected={this.state.addonSelected}
          panels={this.panels}
        />
      </View>
    );
  }
}

OnDeviceUI.propTypes = {
  stories: PropTypes.shape({
    dumpStoryBook: PropTypes.func.isRequired,
    on: PropTypes.func.isRequired,
    emit: PropTypes.func.isRequired,
    removeListener: PropTypes.func.isRequired,
  }).isRequired,
  events: PropTypes.shape({
    on: PropTypes.func.isRequired,
    emit: PropTypes.func.isRequired,
    removeListener: PropTypes.func.isRequired,
  }).isRequired,
  url: PropTypes.string,
  isStoryMenuOpen: PropTypes.bool,
  isUIOpen: PropTypes.bool,
};

OnDeviceUI.defaultProps = {
  url: '',
  isStoryMenuOpen: false,
  isUIOpen: true,
};
