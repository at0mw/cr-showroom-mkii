const serialJoins = (() => {
	const SurfaceConfigMessage = '6';

	const LightingPresetsConfig = '2';
	const LightingPresetSelect = '4';
	const LightingPresetReorder = '3';
	const LightingPresetCreate = '8';
	const LightingInputColour = '36';
	const LightingInputColourFb = '37';
	// Shade Control Module
	const ShadeControlShadeLevel = '24';
	const ShadeControlShadeLevelFb = '25';
	const ShadeControlShadesConfig = '26';
	const ShadeControlPresetCreate = '27';
	const ShadeControlPresetConfig = '29';
	const ShadeControlPresetReorder = '30';
	const ShadeControlPresetSelect = '5';

	const AirMediaAddressFb = "41";
	const AirMediaCodeFb = "42";

	// I think all one serial join for 1 unit (use json to flesh out actions instead)
	return {
		// Shade Control Module
		ShadeControlShadeLevel,
		ShadeControlShadeLevelFb,
		ShadeControlShadesConfig,
		ShadeControlPresetConfig,
		ShadeControlPresetSelect,
		ShadeControlPresetCreate,
		ShadeControlPresetReorder,

		SurfaceConfigMessage,

		LightingPresetsConfig,
		LightingInputColour,
		LightingInputColourFb,
		LightingPresetSelect,
		LightingPresetReorder,
		LightingPresetCreate,

		AirMediaAddressFb,
		AirMediaCodeFb
	};
})();
