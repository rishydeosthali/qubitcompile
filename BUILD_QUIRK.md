# Building Custom Quirk Simulator

To build the customized Quirk simulator with dark theme:

1. Navigate to the quirk directory:
```bash
cd public/quirk
```

2. Install dependencies (you may need to use --legacy-peer-deps):
```bash
npm install --legacy-peer-deps
```

3. Build the simulator:
```bash
npm run build
```

4. The built file will be in `public/quirk/out/quirk.html`

5. Update the QuantumSimulator component to load from the local file instead of the hosted version.

Note: If you encounter issues with puppeteer, you can skip it as it's only needed for tests.

