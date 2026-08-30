import React from 'react';

import type { MissionRenderProps } from './shared';
import {
  ApothemPractice,
  LinearWorkshop,
  PitagorasScale,
  PolygonTriangulationPractice,
  SurfaceAreaPractice,
  SystemSolver,
  TriangleAreaPractice,
  VolumeCubePractice,
  VolumePrismPractice,
} from './practice';
import {
  AngleMasteryMission,
  ApothemaSecretMission,
  AreaMasterMission,
  OptimizationChallenge,
  PackagingOptimizationChallenge,
  PerimeterGuardianMission,
  SpaceBuilderMission,
  SupremeEngineerMission,
  SystemBlueprintMission,
  TriangleBalanceMission,
} from './quiz';
import {
  CartesianRouteMission,
  ConvexityTapMission,
  ConvexityTrapMission,
  DetectiveReportMission,
  EquationVaultMission,
  ExternalAngleVisualizer,
  GuidedFirstMission,
  NamingShapesMission,
  PolygonAngleCalculator,
  SymmetryExplorer,
} from './interactive';

// Missões com interação própria: id da missão -> componente.
// Para adicionar uma missão nova, crie o componente no arquivo de tema
// correspondente (practice / quiz / interactive) e registre aqui.
// Missões puramente algébricas ficam em src/data/equationMissions.ts.
export const customMissionComponents: Record<string, React.ComponentType<MissionRenderProps>> = {
  fase1_m1: GuidedFirstMission,
  fase1_m2: ConvexityTrapMission,
  fase1_m3: NamingShapesMission,
  fase1_m4: ConvexityTapMission,
  fase1_m5: DetectiveReportMission,
  fase2_m1: PerimeterGuardianMission,
  fase2_m2: AreaMasterMission,
  fase2_m3: ApothemaSecretMission,
  fase2_m4: SpaceBuilderMission,
  fase2_m5: SupremeEngineerMission,
  fase3_m1: PolygonAngleCalculator,
  fase3_m2: ExternalAngleVisualizer,
  fase3_m3: SymmetryExplorer,
  fase3_m4: AngleMasteryMission,
  fase4_m1: EquationVaultMission,
  fase4_m2: TriangleBalanceMission,
  fase4_m3: CartesianRouteMission,
  fase4_m4: SystemBlueprintMission,
  fase5_m1: TriangleAreaPractice,
  fase5_m2: PolygonTriangulationPractice,
  fase5_m3: ApothemPractice,
  fase6_m1: LinearWorkshop,
  fase6_m2: SystemSolver,
  fase6_m3: PitagorasScale,
  fase6_m4: OptimizationChallenge,
  fase8_m1: VolumeCubePractice,
  fase8_m2: VolumePrismPractice,
  fase8_m3: SurfaceAreaPractice,
  fase8_m4: PackagingOptimizationChallenge,
};
