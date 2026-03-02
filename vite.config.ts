import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import AdmZip from 'adm-zip';
import fs from 'fs';

function sourceDownloadPlugin() {
  return {
    name: 'source-download',
    configureServer(server: any) {
      server.middlewares.use('/api/download-source', (req: any, res: any) => {
        try {
          const zip = new AdmZip();
          
          if (fs.existsSync('./src')) {
            zip.addLocalFolder('./src', 'src');
          }
          
          if (fs.existsSync('./public')) {
            const publicFiles = fs.readdirSync('./public');
            publicFiles.forEach(file => {
              if (file !== 'aging-studio-source.zip' && file !== 'aging-studio.zip') {
                const filePath = path.join('./public', file);
                if (fs.statSync(filePath).isDirectory()) {
                  zip.addLocalFolder(filePath, path.join('public', file));
                } else {
                  zip.addLocalFile(filePath, 'public');
                }
              }
            });
          }
          
          const files = [
            'index.html',
            'package.json',
            'tsconfig.json',
            'vite.config.ts',
            '.env.example',
            '.gitignore',
            'metadata.json',
            'create-zip.cjs'
          ];
          
          files.forEach(file => {
            if (fs.existsSync(file)) {
              zip.addLocalFile(file);
            }
          });
          
          const zipBuffer = zip.toBuffer();
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', 'attachment; filename=aging-studio-source.zip');
          res.end(zipBuffer);
        } catch (error) {
          console.error('Error generating zip:', error);
          res.statusCode = 500;
          res.end('Error generating zip file');
        }
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), sourceDownloadPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
