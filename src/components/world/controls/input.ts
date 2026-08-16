export interface DrivingInput {
  throttle: number;
  brake: number;
  steer: number;
  handbrake: boolean;
  nitro: boolean;
}

export function readDrivingInput(keys: Set<string>, gamepadIndex: number): DrivingInput {
  let throttle = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0;
  let brake = keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0;
  let steer = (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0)
    - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0);
  const gamepad = navigator.getGamepads()[gamepadIndex];
  if (gamepad) {
    const axisY = gamepad.axes[1] || 0;
    const axisX = gamepad.axes[0] || 0;
    if (axisY < -0.15) throttle = Math.abs(axisY);
    if (axisY > 0.15) brake = axisY;
    if (Math.abs(axisX) > 0.15) steer = -axisX;
  }
  return {
    throttle,
    brake,
    steer,
    handbrake: keys.has('Space'),
    nitro: keys.has('ShiftLeft') || keys.has('ShiftRight'),
  };
}
