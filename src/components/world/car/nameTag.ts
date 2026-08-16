import * as THREE from 'three';

export function createDriverNameTag(name: string, color: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(0, 3.15, 0);
  sprite.scale.set(5.4, 1.02, 1);

  const update = (nextName: string, nextColor: number) => {
    const colorHex = `#${nextColor.toString(16).padStart(6, '0')}`;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(7, 10, 20, 0.72)';
    context.fillRect(36, 12, 440, 68);
    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.lineWidth = 2;
    context.strokeRect(36, 12, 440, 68);
    context.fillStyle = colorHex;
    context.beginPath();
    context.arc(72, 46, 10, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#f5f7ff';
    context.font = '700 28px monospace';
    context.textBaseline = 'middle';
    context.fillText(nextName.slice(0, 18), 98, 47);
    texture.needsUpdate = true;
  };
  sprite.userData.updateDriver = update;
  update(name, color);
  return sprite;
}
