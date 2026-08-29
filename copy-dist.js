import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Run Vite build if dist/assets not yet built
const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(path.join(distDir, 'index.html')) || !fs.existsSync(assetsDir)) {
  console.log('Starting production Vite build...');
  try {
    execSync('npx vite build --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('Vite build completed successfully.');
  } catch (error) {
    console.error('Vite build failed:', error);
    process.exit(1);
  }
}
const djangoDir = path.join(process.cwd(), 'public', 'Django');

// Ensure directories exist
if (!fs.existsSync(djangoDir)) {
  fs.mkdirSync(djangoDir, { recursive: true });
  fs.chmodSync(djangoDir, 0o777);
}

// 2. Discover newly built assets in dist/assets
let jsFile = '';
let cssFile = '';

if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  for (const f of assetFiles) {
    if (f.startsWith('index-') && f.endsWith('.js')) {
      jsFile = f;
    }
    if (f.startsWith('index-') && f.endsWith('.css')) {
      cssFile = f;
    }
  }
}

if (!jsFile || !cssFile) {
  console.error('Could not find compiled JS or CSS files in dist/assets!');
  process.exit(1);
}

console.log(`Discovered built assets: JS = ${jsFile}, CSS = ${cssFile}`);

// Helper to remove old hashed files
function cleanOldAssets(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.startsWith('index-') && (f.endsWith('.js') || f.endsWith('.css'))) {
        fs.unlinkSync(path.join(dir, f));
        console.log(`Deleted old asset file: ${path.join(dir, f)}`);
      }
    }
  }
}

// 3. Clean old assets in public/Django
console.log('Cleaning up old asset files...');
cleanOldAssets(djangoDir);

// 4. Copy new flat assets and files
console.log('Copying files flatly into public/Django...');

// Copy JS & CSS to public/Django/
fs.copyFileSync(path.join(assetsDir, jsFile), path.join(djangoDir, jsFile));
fs.chmodSync(path.join(djangoDir, jsFile), 0o666);
fs.copyFileSync(path.join(assetsDir, cssFile), path.join(djangoDir, cssFile));
fs.chmodSync(path.join(djangoDir, cssFile), 0o666);

// Copy appData.json to public/Django/ and dist/
const appDataSrc = path.join(process.cwd(), 'src', 'data', 'appData.json');
if (fs.existsSync(appDataSrc)) {
  // Copy to public/Django/
  fs.copyFileSync(appDataSrc, path.join(djangoDir, 'appData.json'));
  fs.chmodSync(path.join(djangoDir, 'appData.json'), 0o666);
  
  // Also copy to dist/
  fs.copyFileSync(appDataSrc, path.join(distDir, 'appData.json'));
  fs.chmodSync(path.join(distDir, 'appData.json'), 0o666);
  console.log('Successfully copied appData.json to public/Django/ and dist/.');
} else {
  console.warn('Source appData.json not found in src/data/appData.json!');
}

// 5. Copy and rewrite index.html paths in public/Django/ to support Django's {% static %} engine
const indexHtmlSrc = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlSrc)) {
  let htmlContent = fs.readFileSync(indexHtmlSrc, 'utf8');
  
  // Convert standard Vite paths into standard Django template syntax
  let djangoHtmlContent = '{% load static %}\n' + htmlContent;
  
  // Replace references with {% static 'Django/...' %}
  djangoHtmlContent = djangoHtmlContent.replace(
    new RegExp(`src="/assets/${jsFile}"`, 'g'),
    `src="{% static 'Django/${jsFile}' %}"`
  );
  djangoHtmlContent = djangoHtmlContent.replace(
    new RegExp(`href="/assets/${cssFile}"`, 'g'),
    `href="{% static 'Django/${cssFile}' %}"`
  );
  djangoHtmlContent = djangoHtmlContent.replace(
    new RegExp(`/assets/${jsFile}`, 'g'),
    `{% static 'Django/${jsFile}' %}`
  );
  djangoHtmlContent = djangoHtmlContent.replace(
    new RegExp(`/assets/${cssFile}`, 'g'),
    `{% static 'Django/${cssFile}' %}`
  );

  // Write to public/Django/index.html
  fs.writeFileSync(path.join(djangoDir, 'index.html'), djangoHtmlContent, 'utf8');
  fs.chmodSync(path.join(djangoDir, 'index.html'), 0o666);
  console.log('Successfully generated Django-compatible index.html with static template tags.');
}

// 6. Ensure dist/Django directory exists and sync all files from public/Django to dist/Django
const distDjangoDir = path.join(distDir, 'Django');
if (!fs.existsSync(distDjangoDir)) {
  fs.mkdirSync(distDjangoDir, { recursive: true });
}

// Copy all Django files from public/Django to dist/Django
if (fs.existsSync(djangoDir)) {
  const allDjangoFiles = fs.readdirSync(djangoDir);
  for (const fileName of allDjangoFiles) {
    const src = path.join(djangoDir, fileName);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(distDjangoDir, fileName));
      fs.chmodSync(path.join(distDjangoDir, fileName), 0o666);
      console.log(`Synced ${fileName} to dist/Django/`);
    }
  }
}

console.log('Migration and flat copies completed successfully!');
