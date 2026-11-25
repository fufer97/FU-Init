import React, { useEffect, useMemo, useState } from 'react';
import {
  ActiveStep,
  DevMode,
  LanguageMode,
  PrimaryAgent,
  ProjectInitConfig,
  StageBlueprint,
  StageId,
} from './types/config';
import {
  createInitialStageBlueprints,
  DEFAULT_CONFIG,
} from './data/stageBlueprints';
import {
  addCustomSubfolder,
  addRootFolderToStage,
  deleteCustomTreeNode,
  moveTreeNodeInLevel,
  renameTreeNode,
  resolveDevMode,
  toggleTreeNodeChecked,
} from './engine/treeEngine';
import { buildArtifactBundle } from './engine/templateRenderer';
import { buildZipBlob, getZipFileName } from './engine/zipExporter';
import { TopNav } from './components/TopNav';
import { AtlasLanding } from './components/AtlasLanding';
import { GlobalConfigStep } from './components/GlobalConfigStep';
import { TreeWorkbenchStep } from './components/TreeWorkbenchStep';
import { ExportPreviewStep } from './components/ExportPreviewStep';

const STORAGE_KEY = 'project_init_swiss_config_v2';
const ALLOWED_STAGES: StageId[] = ['02', '03'];

export const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<ActiveStep>('landing');
  const [config, setConfig] = useState<ProjectInitConfig>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.selectedStages)) {
          const filtered = parsed.selectedStages.filter((id: StageId) =>
            ALLOWED_STAGES.includes(id)
          );
          if (filtered.length > 0) {
            return { ...DEFAULT_CONFIG, ...parsed, selectedStages: filtered };
          }
        }
      }
    } catch {
      // Safe fallback under strict iframe sandboxes
    }
    return DEFAULT_CONFIG;
  });

  const [blueprints, setBlueprints] = useState<Record<StageId, StageBlueprint>>(() =>
    createInitialStageBlueprints()
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore sandbox storage errors
    }
  }, [config]);

  const handleSelectStep = (step: ActiveStep) => {
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bundle = useMemo(
    () => buildArtifactBundle(config, blueprints),
    [config, blueprints]
  );

  const handleChangeLanguage = (language: LanguageMode) => {
    setConfig((prev) => ({ ...prev, language }));
  };

  const handleChangeAgent = (primaryAgent: PrimaryAgent) => {
    setConfig((prev) => ({ ...prev, primaryAgent }));
  };

  const handleToggleStage = (stageId: StageId): string | null => {
    if (!ALLOWED_STAGES.includes(stageId)) return null;
    const exists = config.selectedStages.includes(stageId);
    if (exists && config.selectedStages.length <= 1) {
      return '至少保留一个阶段';
    }
    const nextStages = exists
      ? config.selectedStages.filter((id) => id !== stageId)
      : ALLOWED_STAGES.filter(
          (id) => id === stageId || config.selectedStages.includes(id)
        );

    const nextDevMode = resolveDevMode(nextStages, false, config.devMode);
    setConfig((prev) => ({
      ...prev,
      selectedStages: nextStages,
      devModeOverride: false,
      devMode: nextDevMode,
    }));
    return null;
  };

  const handleToggleDevModeManual = (targetMode: DevMode) => {
    setConfig((prev) => ({
      ...prev,
      devMode: targetMode,
      devModeOverride: true,
    }));
  };

  const handleToggleNode = (stageId: StageId, nodeId: string) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: toggleTreeNodeChecked(prev[stageId].nodes, nodeId),
      },
    }));
  };

  const handleMoveNode = (
    stageId: StageId,
    nodeId: string,
    direction: 'up' | 'down'
  ) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: moveTreeNodeInLevel(prev[stageId].nodes, nodeId, direction),
      },
    }));
  };

  const handleAddRootFolder = (
    stageId: StageId,
    spec: { nameZh: string; nameEn: string; description: string }
  ) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: addRootFolderToStage(prev[stageId].nodes, stageId, spec),
      },
    }));
  };

  const handleAddSubfolder = (
    stageId: StageId,
    parentId: string,
    spec: { nameZh: string; nameEn: string; description: string }
  ) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: addCustomSubfolder(prev[stageId].nodes, parentId, spec),
      },
    }));
  };

  const handleRenameNode = (
    stageId: StageId,
    nodeId: string,
    names: { nameZh: string; nameEn: string }
  ) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: renameTreeNode(prev[stageId].nodes, nodeId, names),
      },
    }));
  };

  const handleDeleteCustomNode = (stageId: StageId, nodeId: string) => {
    setBlueprints((prev) => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        nodes: deleteCustomTreeNode(prev[stageId].nodes, nodeId),
      },
    }));
  };

  const triggerZipDownload = async () => {
    try {
      const blob = await buildZipBlob(bundle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getZipFileName(bundle);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch {
      // Fallback details section inside ExportPreviewStep handles restricted environments
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <TopNav activeStep={activeStep} onSelectStep={handleSelectStep} />

      <main className="flex-1" key={activeStep}>
        {activeStep === 'landing' && (
          <AtlasLanding onStartBuild={() => handleSelectStep('config')} />
        )}

        {activeStep === 'config' && (
          <GlobalConfigStep
            config={config}
            blueprints={blueprints}
            onChangeLanguage={handleChangeLanguage}
            onChangeAgent={handleChangeAgent}
            onToggleStage={handleToggleStage}
            onNextToWorkbench={() => handleSelectStep('workbench')}
          />
        )}

        {activeStep === 'workbench' && (
          <TreeWorkbenchStep
            bundle={bundle}
            onToggleNode={handleToggleNode}
            onMoveNode={handleMoveNode}
            onAddRootFolder={handleAddRootFolder}
            onAddSubfolder={handleAddSubfolder}
            onRenameNode={handleRenameNode}
            onDeleteCustomNode={handleDeleteCustomNode}
            onToggleDevModeManual={handleToggleDevModeManual}
            onBackToConfig={() => handleSelectStep('config')}
            onNextToExport={() => handleSelectStep('export')}
          />
        )}

        {activeStep === 'export' && (
          <ExportPreviewStep
            bundle={bundle}
            onBackToWorkbench={() => handleSelectStep('workbench')}
            onTriggerZipDownload={triggerZipDownload}
          />
        )}
      </main>
    </div>
  );
};

export default App;
