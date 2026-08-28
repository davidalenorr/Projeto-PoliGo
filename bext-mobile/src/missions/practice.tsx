import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { numbersEqual, parseFlexibleNumber } from '@/src/utils/equationValidation';
import { styles } from './styles';
import { MissionCompletionAction, MissionRenderProps, PracticeFeedback, RegenerateButton } from './shared';
import {
  makeApothem,
  makeCube,
  makeLinear,
  makePrism,
  makePythagorasCases,
  makeSurface,
  makeSystem,
  makeTriangleArea,
  makeTriangulation,
} from './procedural';

export function TriangleAreaPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeTriangleArea);
  const [userArea, setUserArea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const resetAttempt = () => {
    setUserArea('');
    setSubmitted(false);
    setCanComplete(false);
    setFeedback(null);
  };

  const newQuestion = () => {
    setQ(makeTriangleArea());
    resetAttempt();
  };

  const handleValidate = () => {
    const parsedArea = parseFlexibleNumber(userArea);

    if (parsedArea === null || parsedArea <= 0) {
      setFeedback('Insira uma área válida, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedArea, q.area, 1e-2)) {
      setFeedback(`Correto! A área calculada é ${q.area} m².`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. Área do triângulo: A = (b × h) / 2 = (${q.base} × ${q.height}) / 2.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Área de Triângulo</Text>
      <Text style={styles.sectionSubtitle}>Calcule a área do triângulo dado.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Triângulo</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <Text style={styles.caseContext}>Base (b): <Text style={{ fontWeight: 'bold' }}>{q.base} m</Text></Text>
          <Text style={styles.caseContext}>Altura (h): <Text style={{ fontWeight: 'bold' }}>{q.height} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área Calculada (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 15"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function PolygonTriangulationPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeTriangulation);
  const [userTotal, setUserTotal] = useState('');
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeTriangulation());
    setUserTotal('');
    setDone(false);
    setCanComplete(false);
    setFeedback(null);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Triangulação de Polígonos</Text>
      <Text style={styles.sectionSubtitle}>Some as áreas dos triângulos que compõem o polígono.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Áreas dos componentes</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          {q.parts.map((part, idx) => (
            <Text key={idx} style={styles.caseContext}>
              • Triângulo {idx + 1}: <Text style={{ fontWeight: 'bold' }}>{part} m²</Text>
            </Text>
          ))}
        </View>

        <Text style={styles.caseContext}>Insira a Área Total (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userTotal}
          onChangeText={(value) => {
            setUserTotal(value);
            setDone(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!done ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedTotal = parseFlexibleNumber(userTotal);
              if (parsedTotal === null || parsedTotal <= 0) {
                setFeedback('Preencha a área com um número válido maior que zero.');
                setDone(true);
                setCanComplete(false);
                return;
              }

              setDone(true);
              if (numbersEqual(parsedTotal, q.total, 1e-2)) {
                setFeedback(`Correto! A área total do polígono é ${q.total} m².`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Soma incorreta. Some as áreas dos ${q.parts.length} triângulos: ${q.parts.join(' + ')}.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Confirmar soma</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setDone(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function ApothemPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeApothem);
  const [userArea, setUserArea] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeApothem());
    setUserArea('');
    setChecked(false);
    setCanComplete(false);
    setFeedback(null);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Prática: Área via Apótema</Text>
      <Text style={styles.sectionSubtitle}>Use A = (P × a) / 2</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Polígono</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <Text style={styles.caseContext}>Perímetro (P): <Text style={{ fontWeight: 'bold' }}>{q.perimeter} m</Text></Text>
          <Text style={styles.caseContext}>Apótema (a): <Text style={{ fontWeight: 'bold' }}>{q.apothem} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área Calculada (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 40"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedArea = parseFlexibleNumber(userArea);

              if (parsedArea === null || parsedArea <= 0) {
                setFeedback('A área deve ser um número válido maior que zero.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (numbersEqual(parsedArea, q.area, 1e-2)) {
                setFeedback(`Correto! A área é ${q.area} m².`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Resultado incorreto. A = (P × a) / 2 = (${q.perimeter} × ${q.apothem}) / 2.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar cálculo</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function LinearWorkshop({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeLinear);
  const [x, setX] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeLinear());
    setX('');
    setChecked(false);
    setCanComplete(false);
    setFeedback(null);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Oficina Linear</Text>
      <Text style={styles.sectionSubtitle}>Resolva {q.equation}</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.caseContext}>Valor de x</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={x}
          onChangeText={(value) => {
            setX(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedX = parseFlexibleNumber(x);
              if (parsedX === null) {
                setFeedback('Insira um valor numérico válido para x.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (numbersEqual(parsedX, q.x, 1e-2)) {
                setFeedback(`Correto! x = ${q.x}.`);
                setCanComplete(true);
                return;
              }

              setFeedback(`Resposta incorreta. Isole x: ${q.a}x = ${q.c} − ${q.b}, depois divida por ${q.a}.`);
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Verificar</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function SystemSolver({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeSystem);
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeSystem());
    setX('');
    setY('');
    setChecked(false);
    setCanComplete(false);
    setFeedback(null);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Solver de Sistemas</Text>
      <Text style={styles.sectionSubtitle}>Sistema: {q.sumEquation} e {q.diffEquation}</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.caseContext}>x</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={x}
          onChangeText={(value) => {
            setX(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />
        <Text style={styles.caseContext}>y</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={y}
          onChangeText={(value) => {
            setY(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!checked ? (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              const parsedX = parseFlexibleNumber(x);
              const parsedY = parseFlexibleNumber(y);

              if (parsedX === null || parsedY === null) {
                setFeedback('Insira valores numéricos válidos para x e y.');
                setChecked(true);
                setCanComplete(false);
                return;
              }

              setChecked(true);
              if (numbersEqual(parsedX, q.x, 1e-2) && numbersEqual(parsedY, q.y, 1e-2)) {
                setFeedback('Solução correta!');
                setCanComplete(true);
                return;
              }

              setFeedback('Solução incorreta. Some as duas equações para eliminar y e encontrar x primeiro.');
              setCanComplete(false);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Validar</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function PitagorasScale({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [cases, setCases] = useState(() => makePythagorasCases(4));
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const currentCase = cases[currentStep];

  const handleVerify = () => {
    const parsed = parseFlexibleNumber(userInput);
    if (parsed === null || parsed <= 0) {
      setFeedback('Insira um número válido maior que zero.');
      setChecked(true);
      setCanComplete(false);
      return;
    }

    setChecked(true);
    if (numbersEqual(parsed, currentCase.expected, 1e-2)) {
      setFeedback(`Correto! A resposta é ${currentCase.expected}.`);
      setCanComplete(true);
    } else {
      setFeedback(`Resultado incorreto. Lembre-se: a² + b² = c². Isole o termo que falta e tire a raiz quadrada.`);
      setCanComplete(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < cases.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setUserInput('');
      setChecked(false);
      setFeedback(null);
      setCanComplete(false);
    } else {
      onComplete();
    }
  };

  const newQuestions = () => {
    setCases(makePythagorasCases(4));
    setCurrentStep(0);
    setUserInput('');
    setChecked(false);
    setFeedback(null);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Escala de Pitágoras</Text>
      <Text style={styles.sectionSubtitle}>Passo {currentStep + 1} de {cases.length}</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Caso Prático</Text>
        <Text style={[styles.caseContext, { marginBottom: 12, fontSize: 16 }]}>{currentCase.prompt}</Text>

        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Insira sua resposta..."
          value={userInput}
          onChangeText={(value) => {
            setUserInput(value);
            setChecked(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!checked ? (
          <Pressable style={styles.nextCaseButton} onPress={handleVerify}>
            <Text style={styles.nextCaseButtonText}>Calcular</Text>
          </Pressable>
        ) : canComplete ? (
          currentStep < cases.length - 1 ? (
            <Pressable style={styles.nextCaseButton} onPress={handleNextStep}>
              <Text style={styles.nextCaseButtonText}>Próximo Passo</Text>
            </Pressable>
          ) : (
            <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
          )
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setChecked(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Recalcular</Text>
          </Pressable>
        )}

        {currentStep === 0 && !checked && <RegenerateButton onPress={newQuestions} />}
      </View>
    </View>
  );
}

export function VolumeCubePractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeCube);
  const [userVolume, setUserVolume] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeCube());
    setUserVolume('');
    setSubmitted(false);
    setCanComplete(false);
    setFeedback(null);
  };

  const handleValidate = () => {
    const parsedVol = parseFlexibleNumber(userVolume);

    if (parsedVol === null || parsedVol <= 0) {
      setFeedback('Insira um volume válido, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedVol, q.volume, 1e-2)) {
      setFeedback(`Correto! O volume do cubo é ${q.volume} cm³.`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. V = a³ = ${q.edge} × ${q.edge} × ${q.edge}.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Volume do Cubo</Text>
      <Text style={styles.sectionSubtitle}>Calcule o volume tridimensional do cubo dado.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Valores do Cubo</Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.caseContext}>Aresta (a): <Text style={{ fontWeight: 'bold' }}>{q.edge} cm</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira o Volume Calculado (cm³)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userVolume}
          onChangeText={(value) => {
            setUserVolume(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function VolumePrismPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makePrism);
  const [userVolume, setUserVolume] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makePrism());
    setUserVolume('');
    setSubmitted(false);
    setCanComplete(false);
    setFeedback(null);
  };

  const handleValidate = () => {
    const parsedVol = parseFlexibleNumber(userVolume);

    if (parsedVol === null || parsedVol <= 0) {
      setFeedback('Insira um volume válido, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedVol, q.volume, 1e-2)) {
      setFeedback(`Correto! O volume do bloco é ${q.volume} m³.`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. V = c × l × h = ${q.length} × ${q.width} × ${q.height}.`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Volume de Bloco Retangular</Text>
      <Text style={styles.sectionSubtitle}>Calcule o volume do paralelepípedo retangular.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Dimensões da Caixa</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={styles.caseContext}>• Comprimento: <Text style={{ fontWeight: 'bold' }}>{q.length} m</Text></Text>
          <Text style={styles.caseContext}>• Largura: <Text style={{ fontWeight: 'bold' }}>{q.width} m</Text></Text>
          <Text style={styles.caseContext}>• Altura: <Text style={{ fontWeight: 'bold' }}>{q.height} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira o Volume Calculado (m³)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 50"
          value={userVolume}
          onChangeText={(value) => {
            setUserVolume(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}

export function SurfaceAreaPractice({ onComplete, alreadyCompleted, nextMissionId, onNext }: MissionRenderProps) {
  const [q, setQ] = useState(makeSurface);
  const [userArea, setUserArea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [canComplete, setCanComplete] = useState(false);

  const newQuestion = () => {
    setQ(makeSurface());
    setUserArea('');
    setSubmitted(false);
    setCanComplete(false);
    setFeedback(null);
  };

  const handleValidate = () => {
    const parsedArea = parseFlexibleNumber(userArea);

    if (parsedArea === null || parsedArea <= 0) {
      setFeedback('Insira uma área válida, maior que zero.');
      setSubmitted(true);
      setCanComplete(false);
      return;
    }

    setSubmitted(true);
    if (numbersEqual(parsedArea, q.area, 1e-2)) {
      setFeedback(`Correto! A área total de superfície é ${q.area} m².`);
      setCanComplete(true);
      return;
    }

    setFeedback(`Resultado incorreto. A = 2 × (ab + ac + bc) = 2 × (${q.a}×${q.b} + ${q.a}×${q.c} + ${q.b}×${q.c}).`);
    setCanComplete(false);
  };

  return (
    <View style={styles.missionCard}>
      <Text style={styles.sectionTitle}>Área de Superfície</Text>
      <Text style={styles.sectionSubtitle}>Calcule a área total das faces do bloco retangular.</Text>

      <View style={styles.trainingCard}>
        <Text style={styles.trainingTitle}>Dimensões da Caixa</Text>
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={styles.caseContext}>• Lado a: <Text style={{ fontWeight: 'bold' }}>{q.a} m</Text></Text>
          <Text style={styles.caseContext}>• Lado b: <Text style={{ fontWeight: 'bold' }}>{q.b} m</Text></Text>
          <Text style={styles.caseContext}>• Lado c: <Text style={{ fontWeight: 'bold' }}>{q.c} m</Text></Text>
        </View>

        <Text style={styles.caseContext}>Insira a Área de Superfície (m²)</Text>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Ex: 80"
          value={userArea}
          onChangeText={(value) => {
            setUserArea(value);
            setSubmitted(false);
            setCanComplete(false);
            setFeedback(null);
          }}
        />

        <PracticeFeedback feedback={feedback} ok={canComplete} />

        {!submitted ? (
          <Pressable style={styles.nextCaseButton} onPress={handleValidate}>
            <Text style={styles.nextCaseButtonText}>Validar resposta</Text>
          </Pressable>
        ) : canComplete ? (
          <MissionCompletionAction alreadyCompleted={alreadyCompleted} nextMissionId={nextMissionId} onComplete={onComplete} onNext={onNext} />
        ) : (
          <Pressable
            style={styles.nextCaseButton}
            onPress={() => {
              setSubmitted(false);
              setFeedback(null);
            }}
          >
            <Text style={styles.nextCaseButtonText}>Tentar novamente</Text>
          </Pressable>
        )}

        {!canComplete && <RegenerateButton onPress={newQuestion} />}
      </View>
    </View>
  );
}
