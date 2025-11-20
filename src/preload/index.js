import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  readModelFile: (filename) => ipcRenderer.invoke('read-model-file', filename),
  listModelFiles: () => ipcRenderer.invoke('list-model-files'),
  loadModelWithAssets: (modelName) => ipcRenderer.invoke('load-model-with-assets', modelName),
  openPdfWindow: () => ipcRenderer.send('open-pdf-window')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}