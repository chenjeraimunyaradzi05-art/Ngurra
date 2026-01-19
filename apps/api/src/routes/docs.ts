"use strict";

const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

function getSpecPath() {
  return path.join(__dirname, '..', '..', 'openapi.yaml');
}

function loadOpenApiSpec() {
  const specPath = getSpecPath();
  const raw = fs.readFileSync(specPath, 'utf8');
  return yaml.load(raw);
}

let cachedSpec = null;
let cachedMtimeMs = null;
function getSpec() {
  const specPath = getSpecPath();
  try {
    const stat = fs.statSync(specPath);
    const mtimeMs = stat.mtimeMs;
    if (cachedSpec && cachedMtimeMs === mtimeMs) return cachedSpec;
    cachedSpec = loadOpenApiSpec();
    cachedMtimeMs = mtimeMs;
    return cachedSpec;
  } catch (err) {
    if (cachedSpec) return cachedSpec;
    throw err;
  }
}

router.get('/openapi.yaml', (req, res) => {
  try {
    const specPath = getSpecPath();
    const raw = fs.readFileSync(specPath, 'utf8');
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    return res.send(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to serve openapi.yaml', err);
    return res.status(500).json({ error: 'Failed to load OpenAPI spec' });
  }
});

router.get('/openapi.json', (req, res) => {
  try {
    return res.json(getSpec());
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to serve openapi.json', err);
    return res.status(500).json({ error: 'Failed to load OpenAPI spec' });
  }
});

// Swagger UI at /api/docs
router.use('/', swaggerUi.serve);
router.get('/', (req, res, next) => {
  try {
    const spec = getSpec();
    return swaggerUi.setup(spec, {
      customSiteTitle: 'Ngurra Pathways API Docs',
    })(req, res, next);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to render Swagger UI', err);
    return res.status(500).json({ error: 'Failed to render API docs' });
  }
});

export default router;

