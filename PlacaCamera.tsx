import React, { useRef, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

interface PlacaCameraProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

/**
 * Câmera guiada para placa.
 * A moldura indica a área que será mantida no recorte automático.
 */
export default function PlacaCamera({ visible, onClose, onPhotoTaken }: PlacaCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  const fechar = () => {
    setPhotoUri(null);
    onClose();
  };

  const tirarFoto = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Câmera indisponível', 'A câmera ainda não está pronta. Tente novamente.');
        return;
      }

      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!foto?.uri || !foto.width || !foto.height) {
        Alert.alert('Foto não capturada', 'Não foi possível capturar a placa. Tente novamente.');
        return;
      }

      // Recorte automático centralizado: corresponde à área indicada pela moldura.
      // O usuário deve deixar somente a placa dentro da moldura antes de fotografar.
      const cropWidth = Math.round(foto.width * 0.82);
      const cropHeight = Math.min(Math.round(foto.height * 0.22), Math.round(cropWidth * 0.38));
      const originX = Math.max(0, Math.round((foto.width - cropWidth) / 2));
      const originY = Math.max(0, Math.round((foto.height - cropHeight) / 2));

      const resultado = await ImageManipulator.manipulateAsync(
        foto.uri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPhotoUri(resultado.uri);
    } catch {
      Alert.alert('Erro na câmera', 'Não foi possível tirar a foto da placa. Verifique a permissão da câmera e tente novamente.');
    }
  };

  const usarFoto = () => {
    if (!photoUri) return;
    onPhotoTaken(photoUri);
    setPhotoUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={fechar}>
      <View style={styles.container}>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.previewCancel} onPress={() => setPhotoUri(null)} accessibilityRole="button">
                <Text style={styles.previewCancelText}>Outra</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.usePhotoButton} onPress={usarFoto} accessibilityRole="button">
                <Text style={styles.primaryText}>Usar foto</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : !permission ? (
          <View style={styles.center}>
            <Text style={styles.message}>Verificando a permissão da câmera...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.message}>O SteticCar precisa da câmera para fotografar a placa.</Text>
            <TouchableOpacity style={styles.usePhotoButton} onPress={requestPermission}>
              <Text style={styles.primaryText}>Permitir câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.permissionCancel} onPress={fechar}>
              <Text style={styles.secondaryText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.guide} pointerEvents="none">
              <View style={styles.guideBox} />
              <Text style={styles.guideText}>Enquadre somente a placa dentro da moldura</Text>
            </View>
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={fechar} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={tirarFoto} accessibilityRole="button">
                <View style={styles.captureInner} />
              </TouchableOpacity>
              <View style={styles.actionSpacer} />
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { color: '#ffffff', fontSize: 16, textAlign: 'center', lineHeight: 23, marginBottom: 20 },
  guide: { position: 'absolute', left: 0, right: 0, top: '40%', alignItems: 'center' },
  guideBox: { width: '82%', height: 105, borderWidth: 2, borderColor: '#00aeff', borderRadius: 12, backgroundColor: 'transparent' },
  guideText: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginTop: 12, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cameraActions: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 112, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.62)' },
  cancelButton: { position: 'absolute', left: 22, bottom: 28, minWidth: 86, height: 42, paddingHorizontal: 12, borderRadius: 9, backgroundColor: '#303030', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  actionSpacer: { position: 'absolute', right: 22, width: 86, height: 42 },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#ffffff' },
  preview: { flex: 1, width: '100%', backgroundColor: '#000000' },
  previewActions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22, backgroundColor: '#000000' },
  previewCancel: { width: 88, height: 44, borderRadius: 9, backgroundColor: '#303030', alignItems: 'center', justifyContent: 'center' },
  previewCancelText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  usePhotoButton: { flex: 1, height: 44, backgroundColor: '#0066cc', borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  permissionCancel: { width: 120, height: 42, marginTop: 10, borderRadius: 9, backgroundColor: '#303030', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
