import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as ScreenOrientation from "expo-screen-orientation";

export default function Index() {
  // trava paisagem ao montar
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT).catch(() => {});
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  // permissões
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  // estado de gravação
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!camPerm?.granted) requestCamPerm();
    if (!micPerm?.granted) requestMicPerm();
  }, [camPerm, micPerm]);

  const toggleRecord = async () => {
    const cam = cameraRef.current;
    if (!cam) return;

    try {
      if (!isRecording) {
        setIsRecording(true);
        // Chame sem opções para evitar conflitos de tipo
        const result = await cam.recordAsync();
        // result?.uri -> caminho do vídeo
      } else {
        await cam.stopRecording();
        setIsRecording(false);
      }
    } catch (e) {
      setIsRecording(false);
      console.warn("Erro de gravação:", e);
    }
  };

  if (!camPerm || !micPerm) return <View style={{ flex: 1, backgroundColor: "black" }} />;

  if (!camPerm.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Precisamos da permissão da câmera</Text>
        <TouchableOpacity onPress={requestCamPerm} style={styles.smallBtn}>
          <Text style={styles.smallBtnText}>Conceder</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
        videoQuality="1080p"           // ✅ qualidade correta aqui
        videoStabilizationMode="auto"
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleRecord} style={[styles.recBtn, isRecording && styles.recBtnOn]} />
        <Text style={styles.hint}>{isRecording ? "Gravando..." : "Toque para gravar"}</Text>
      </View>
    </View>
  );
}

const BTN_SIZE = 48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
  },
  recBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#c1121f",
    opacity: 0.9,
  },
  recBtnOn: {
    backgroundColor: "#ff2b2b",
  },
  hint: { color: "white", fontSize: 12, opacity: 0.9 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" },
  info: { color: "white", marginBottom: 12, fontSize: 16 },
  smallBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: "white" },
  smallBtnText: { color: "black", fontWeight: "600" },
});
