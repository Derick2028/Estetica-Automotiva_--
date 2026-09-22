import * as SecureStore from 'expo-secure-store';
const senhaKey=(id:number)=>`steticcar_senha_${id}`;
const BIO='steticcar_cliente_biometria_id';
export async function salvarSenha(id:number, senha:string){ await SecureStore.setItemAsync(senhaKey(id), senha, {keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK}); }
export async function validarSenha(id:number, senha:string){ return (await SecureStore.getItemAsync(senhaKey(id))) === senha; }
export async function salvarClienteBiometria(id:number){ await SecureStore.setItemAsync(BIO,String(id),{keychainAccessible:SecureStore.AFTER_FIRST_UNLOCK}); }
export async function obterClienteBiometriaId(){ const v=await SecureStore.getItemAsync(BIO); return v?Number(v):null; }
export async function removerClienteBiometria(){ await SecureStore.deleteItemAsync(BIO); }
