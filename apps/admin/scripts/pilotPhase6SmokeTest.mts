// ============================================================================
// 🚀 PİLOT FAZ 6 SMOKE TESTİ — TRACK 13 UÇTAN UCA (Adım 126-130)
// Homography matris matematiği + reprojeksiyon hatası (<2cm) • top zıplama
// parabolik fiziği + içeri/dışarı kararları • poz açı geometrisi + X-Factor •
// sensör-vizyon EKF yakınsama + kayıp-kare kurtarma • Track 13 bütünlüğü.
// Çalıştırma: node scripts/pilotPhase6SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  computeHomography, applyHomography, reprojectionError, projectToCourt, undistortPoint,
  cameraElevationDeg, validateCameraPlacement, COURT_STANDARD, type Point2D, type HomographyMatrix,
} from '../src/app/lib/cv/cameraCalibrationEngine.ts';
import {
  fitParabolicFlight, classifyShot, interpolateBallPath, COURT_BOUNDS_STANDARD,
  BALL_MARGIN_M, type BallDetection, type BallTrajectory,
} from '../src/app/lib/cv/ballTrajectoryEngine.ts';
import {
  jointAngleDeg, elbowExtensionAngleDeg, kneeFlexionAtImpactDeg, xFactorSeparationDeg,
  kineticLagMs, kineticLagFromFrames, centerOfMass, COCO_17_NAMES, type PoseFrame,
} from '../src/app/lib/cv/poseEstimationEngine.ts';
import {
  grfFromInsolePressure, grfFromCoMAcceleration, fusionWeight, EkfZAxis, SensorVisionFusionEngine,
  correctImuDrift, VISION_OCCLUSION_MS,
} from '../src/app/lib/fusion/sensorVisionFusionEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 126: HOMOGRAPHY & KALİBRASYON ──────────────────────────────────────
const srcCorners: Point2D[] = [{ x: 100, y: 100 }, { x: 400, y: 100 }, { x: 400, y: 300 }, { x: 100, y: 300 }];
const dstCorners: Point2D[] = [{ x: 0, y: 0 }, { x: 8.23, y: 0 }, { x: 8.23, y: 23.77 }, { x: 0, y: 23.77 }];
const H: HomographyMatrix = computeHomography(srcCorners, dstCorners);
const err = reprojectionError(H, srcCorners, dstCorners);
const centerProj = applyHomography(H, { x: 250, y: 200 });
check('126a. Homography DLT: 4 köşe eşleşmesi → reprojeksiyon hatası < 2cm', err < 0.02, `${err}m`);
check('126b. Kort merkezi projeksiyonu: piksel merkez → (4.115, 11.885) ±5cm', Math.abs(centerProj.x - 4.115) < 0.05 && Math.abs(centerProj.y - 11.885) < 0.05);
const court3D = projectToCourt(H, { x: 250, y: 200 }, 0);
check('126c. 3D kort koordinatı (X,Y,Z)', court3D.z === 0 && typeof court3D.x === 'number' && typeof court3D.y === 'number');
const undist = undistortPoint({ x: 100, y: 50 }, { k1: 0.01, k2: 0.001, p1: 0.002, p2: -0.001 });
check('126d. Distorsiyon düzeltme: radyal + tanjantiyal bileşenler', Math.abs(undist.x - 100) > 0 && Math.abs(undist.y - 50) > 0);
const lowCam = validateCameraPlacement({ position: { x: 0, y: -6, z: 1.2 }, intrinsics: { fx: 900, fy: 900, cx: 320, cy: 180 } }, COURT_STANDARD);
const goodCam = validateCameraPlacement({ position: { x: 0, y: -6, z: 5 }, intrinsics: { fx: 900, fy: 900, cx: 320, cy: 180 } }, COURT_STANDARD);
check('126e. Yerleşim doğrulama: alçak açı flag · yüksek açı geçerli', lowCam.flags.length > 0 && lowCam.valid === false && goodCam.flags.length === 0 && goodCam.valid === true && cameraElevationDeg({ x: 0, y: -6, z: 6 }) === 45);
// ── ADIM 127: TOP YÖRÜNGESİ & İÇERİ/DIŞARI ─────────────────────────────────
const p0: BallDetection = { tMs: 0, x: 0, y: 10, z: 1.5 };
const p1: BallDetection = { tMs: 200, x: 0.2, y: 10.4, z: 2.7 };
const traj: BallTrajectory = fitParabolicFlight(p0, p1);
check('127a. Parabolik uçuş: tepe 3.335m · zıplama (1.436, 12.872) · çarpma 30.21 km/h', traj.apex.heightM === 3.335 && traj.landing?.x === 1.436 && traj.landing?.y === 12.872 && traj.impactSpeedKmh === 30.21);
const rallyIn = classifyShot(traj, COURT_BOUNDS_STANDARD, 'rally');
const outShot = classifyShot({ ...traj, landing: { x: 5.5, y: 12, tMs: 1000 } }, COURT_BOUNDS_STANDARD, 'rally');
const serveFault = classifyShot({ ...traj, landing: { x: 1.436, y: 12.872, tMs: 1000 } }, COURT_BOUNDS_STANDARD, 'serve');
const netTouch = classifyShot({ ...traj, apex: { heightM: 0.5, tMs: 500 }, landing: { x: 1, y: 0.3, tMs: 900 } }, COURT_BOUNDS_STANDARD, 'rally', 0);
check('127b. Karar sınıfları: IN / OUT / FAULT_SERVICE / NET_TOUCH', rallyIn.outcome === 'IN_COURT' && outShot.outcome === 'OUT_OF_BOUNDS' && serveFault.outcome === 'FAULT_SERVICE' && netTouch.outcome === 'NET_TOUCH');
check('127c. Milimetrik marj sabiti ±2mm + interpolasyon', BALL_MARGIN_M === 0.002 && interpolateBallPath([p0, p1], 120).length >= 24 && interpolateBallPath([p0, p1], 120)[0].tMs === 0);

// ── ADIM 128: POZ & EKLEM AÇILARI ───────────────────────────────────────────
check('128a. Eklem açısı geometrisi: 90° dik açı', jointAngleDeg({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }) === 90);
const kp = (x: number, y: number) => ({ x, y, confidence: 0.9 });
const poseFrame: PoseFrame = {
  tMs: 0,
  keypoints: Array.from({ length: 17 }, () => ({ x: 0, y: 0, confidence: 0 })),
};
// COCO indekslerini doldur
const idx = (n: string) => COCO_17_NAMES.indexOf(n as (typeof COCO_17_NAMES)[number]);
poseFrame.keypoints[idx('left_shoulder')] = kp(0, 0);
poseFrame.keypoints[idx('left_elbow')] = kp(0, 1);
poseFrame.keypoints[idx('left_wrist')] = kp(1, 1);
poseFrame.keypoints[idx('left_hip')] = kp(0, 3);
poseFrame.keypoints[idx('left_knee')] = kp(0, 4);
poseFrame.keypoints[idx('left_ankle')] = kp(1, 4);
poseFrame.keypoints[idx('right_shoulder')] = kp(1, 0);
poseFrame.keypoints[idx('right_hip')] = kp(1, 3);
poseFrame.keypoints[idx('nose')] = kp(0.5, -1);
check('128b. Dirsek ekstansiyon 90° + diz fleksiyon 90°', elbowExtensionAngleDeg(poseFrame, 'left') === 90 && kneeFlexionAtImpactDeg(poseFrame, 'left') === 90);
check('128c. X-Factor: paralel omuz/kalça → 0°', xFactorSeparationDeg(poseFrame) === 0);
const rotatedPose: PoseFrame = { tMs: 0, keypoints: poseFrame.keypoints.map((p, i) => (i === idx('right_shoulder') ? kp(0.94, 0.342) : p)) }; // omuz çizgisi 20° döndürülmüş
const xf = xFactorSeparationDeg(rotatedPose);
check('128d. X-Factor: 20° omuz-kalça kinetik ayırımı', Math.abs(xf - 20) < 0.5, `${xf}°`);
const lag = kineticLagFromFrames([
  { tMs: 5000, keypoints: [], footPlant: true },
  { tMs: 5100, keypoints: [] },
  { tMs: 5200, keypoints: [], contact: true },
]);
check('128e. Kinetik lag: ayak basışı 5000 → temas 5200 → 200ms', kineticLagMs(5000, 5200) === 200 && lag.detected === true && lag.lagMs === 200);
check('128f. Kütle merkezi (CoM): kalça ortalaması', centerOfMass(poseFrame).x === 0.5 && centerOfMass(poseFrame).y === 3);
// ── ADIM 129: SENSÖR-VİZYON EKF FÜZYON ──────────────────────────────────────
check('129a. Birim dönüşümler: basınç 100→2.5 BW · a=0→1 BW · a=g→2 BW', grfFromInsolePressure(100) === 2.5 && grfFromInsolePressure(50) === 1.25 && grfFromCoMAcceleration(0) === 1 && grfFromCoMAcceleration(9.81) === 2);
const ekf = new EkfZAxis();
for (let i = 0; i < 8; i++) {
  ekf.predict(0, 10);
  ekf.update(1.0);
}
const ekfState = ekf.state();
check('129b. EKF yakınsama: 8 ölçüm → kovaryans <0.02 + converged', ekfState.converged === true && ekfState.covariance < 0.02 && ekfState.updates >= 5);
const engine = new SensorVisionFusionEngine();
const fused = engine.fuse({ tsMs: 0, pressure: 60, gctMs: 220, imuGyroZ: 0 }, { tsMs: 0, comAccelZ: 2, comConfidence: 0.9, opticalYawDeg: 10 });
const occluded = engine.fuse({ tsMs: 200, pressure: 70, gctMs: 230, imuGyroZ: 0 });
const recovered = engine.fuse({ tsMs: 400, pressure: 65, gctMs: 225, imuGyroZ: 0 }, { tsMs: 400, comAccelZ: 1, comConfidence: 0.85 });
check('129c. Füzyon kaynağı: fused → tıkanma insole_primary → geri dönüş fused', fused.source === 'fused' && occluded.source === 'insole_primary' && occluded.occlusionMs === 200 && recovered.source === 'fused' && recovered.occlusionMs === 0 && VISION_OCCLUSION_MS === 150);
check('129d. GRF füzyon ağırlığı + IMU drift düzeltmesi', fused.grfBw > 1.2 && fused.grfBw < 1.3 && fused.imuDriftCorrected === true && engine.driftCorrectionCount() >= 1 && fusionWeight(0.9, 0) === 0.9);
const drift = correctImuDrift(5, 20, 0.8);
check('129e. IMU drift düzeltmesi: 5° → 20° (güven 0.8) → +12°', drift.correctedDeg === 17 && drift.driftCorrectionDeg === 12);

// ── ADIM 130: TRACK 13 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track13Files = [
  'src/app/lib/cv/cameraCalibrationEngine.ts',
  'src/app/lib/cv/ballTrajectoryEngine.ts',
  'src/app/lib/cv/poseEstimationEngine.ts',
  'src/app/lib/fusion/sensorVisionFusionEngine.ts',
  'src/modules/cv/CourtCameraCalibrationView.tsx',
  'scripts/pilotPhase6SmokeTest.mts',
];
check('130a. Track 13 dosyaları: 4 motor + 1 komponent + smoke mevcut', track13Files.every((f) => existsSync(f)));
const cross = err < 0.02 && rallyIn.outcome === 'IN_COURT' && serveFault.outcome === 'FAULT_SERVICE' && elbowExtensionAngleDeg(poseFrame, 'left') === 90 && ekfState.converged === true && recovered.source === 'fused';
check('130b. Track 13 veri hattı: homography + top + poz + füzyon uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


