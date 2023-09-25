const digitalJoins = (() => {
    // Control Bar Module
    const ControlBarVolumeMute = "16";
    const ControlBarVolumeMuteFb = "17"
    const ControlBarMicMute = "11";
    const ControlBarMicMuteFb = "12"
    const ControlBarMicMenu = "13";

    // Camera Control Module
    const CameraControlDpadUp = "40";
    const CameraControlDpadDown = "41";
    const CameraControlDpadLeft = "42";
    const CameraControlDpadRight = "43";

    const CameraControlRsLrUp = "52";
    const CameraControlRsLrDown = "53";

    const ShadeControlAllOpen = "54";
    const ShadeControlAllClose = "55";

    const AirMediaDisconnectUsers = "56";

  return {
    // Control Bar Module
    ControlBarVolumeMute,
    ControlBarVolumeMuteFb,
    ControlBarMicMute,
    ControlBarMicMuteFb,
    ControlBarMicMenu,
    // Camera Control Module
    CameraControlDpadUp,
    CameraControlDpadDown,
    CameraControlDpadLeft,
    CameraControlDpadRight,
    CameraControlRsLrUp,
    CameraControlRsLrDown,
    // Shade Control Module
    ShadeControlAllOpen,
    ShadeControlAllClose,
    
    AirMediaDisconnectUsers
  };

})();