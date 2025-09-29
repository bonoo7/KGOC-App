import React from 'react';
import { View, StyleSheet } from 'react-native';

const SceneView = ({ children, style }) => {
  return (
    <View style={[styles.sceneContainer, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sceneContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default SceneView;