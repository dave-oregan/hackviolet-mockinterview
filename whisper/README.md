# Whisper Setup
### Step 1
Install node modules
```
npm install
```
### Step 2
Make sure you’re in a Python environment
```
python3 -m venv whisper-env
```
### Step 3
macOS / Linux:
```
source whisper-env/bin/activate
```
Windows (PowerShell):
```
.\whisper-env\Scripts\Activate.ps1
```
### Step 4
```
pip install -U openai-whisper
```
For mac, also:
```
brew install ffmpeg
```
### Step 5
```
npm run whisper
```