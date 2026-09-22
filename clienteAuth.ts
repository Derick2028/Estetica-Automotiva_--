import * as SecureStore from 'expo-secure-store';

const CLIENTE_BIOMETRIA_KEY = 'steticcar_cliente_biometria_id';

export async function salvarClienteBiometria(id: number) {
  await SecureStore.setItemAsync(CLIENTE_BIOMETRIA_KEY, String(id), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function obterClienteBiometriaId() {
  const value = await SecureStore.getItemAsync(CLIENTE_BIOMETRIA_KEY);
  return value ? Number(value) : null;
}

export async function removerClienteBiometria() {
  await SecureStore.deleteItemAsync(CLIENTE_BIOMETRIA_KEY);
}
