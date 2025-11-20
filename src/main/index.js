import { app, shell, BrowserWindow, ipcMain, protocol } from 'electron'
import { join } from 'path'
import { readFile, readdir } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1366,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Importante: desactivar para desarrollo
    }
  })

  mainWindow.maximize();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Cerrar todas las ventanas cuando se cierra la ventana principal
  mainWindow.on('close', () => {
    const allWindows = BrowserWindow.getAllWindows()
    allWindows.forEach(window => {
      if (window !== mainWindow) {
        window.close()
      }
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Abrir DevTools para debugging
  // if (is.dev) {
  //   mainWindow.webContents.openDevTools()
  // }
}

// Función para determinar el tipo MIME
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const mimeTypes = {
    'gltf': 'model/gltf+json',
    'glb': 'model/gltf-binary',
    'bin': 'application/octet-stream',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Handler para leer un solo archivo
ipcMain.handle('read-model-file', async (_event, filename) => {
  try {
    const basePath = is.dev 
      ? join(__dirname, '../../resources/models')
      : join(process.resourcesPath, 'models')
    
    const filePath = join(basePath, filename)
    const buffer = await readFile(filePath)
    
    return {
      success: true,
      data: Array.from(buffer),
      mimeType: getMimeType(filename),
      filename: filename
    }
  } catch (error) {
    console.error('Error leyendo archivo:', filename, error)
    return {
      success: false,
      error: error.message
    }
  }
})

// Handler para listar todos los archivos en la carpeta de modelos
ipcMain.handle('list-model-files', async () => {
  try {
    const basePath = is.dev 
      ? join(__dirname, '../../resources/models')
      : join(process.resourcesPath, 'models')
    
    const files = await readdir(basePath)
    return {
      success: true,
      files: files
    }
  } catch (error) {
    console.error('Error listando archivos:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

// Handler para cargar todos los archivos relacionados con un modelo
ipcMain.handle('load-model-with-assets', async (_event, modelName) => {
  try {
    const basePath = is.dev 
      ? join(__dirname, '../../resources/models')
      : join(process.resourcesPath, 'models')
    
    // Leer todos los archivos en la carpeta
    const allFiles = await readdir(basePath)
    const filesData = {}
    
    // Cargar todos los archivos
    for (const file of allFiles) {
      const filePath = join(basePath, file)
      const buffer = await readFile(filePath)
      filesData[file] = {
        data: Array.from(buffer),
        mimeType: getMimeType(file)
      }
    }
    
    return {
      success: true,
      files: filesData
    }
  } catch (error) {
    console.error('Error cargando assets:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Registrar handlers de IPC
  ipcMain.on('close-app', () => {
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (mainWindow) {
      mainWindow.close()
    }
  })

  ipcMain.on('open-pdf-window', () => {
    console.log('Handler open-pdf-window llamado')
    
    const pdfWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        webSecurity: false
      }
    })

    const pdfPath = is.dev
      ? join(__dirname, '../../src/renderer/src/assets/documento.pdf')
      : join(process.resourcesPath, 'assets/documento.pdf')

    console.log('Intentando cargar PDF desde:', pdfPath)

    // Usar loadURL en lugar de loadFile para PDFs
    pdfWindow.loadURL(`file://${pdfPath}`)

    pdfWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Error cargando PDF:', errorCode, errorDescription)
    })

    pdfWindow.webContents.on('did-finish-load', () => {
      console.log('PDF cargado exitosamente')
    })

    // if (is.dev) {
    //   pdfWindow.webContents.openDevTools()
    // }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})