#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs'
import { loadConfig } from 'unconfig';
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'

const RECORD_CACHE_FILE = 'tiny.cache'
const RECORD_CACHE_FULL_FILE = 'tiny.cache.json'
const TINY_CONFIG = 'tiny.config'

let cache = {}

async function init() {
    const { key, entry } = await loadConfigFile(TINY_CONFIG);
    if (!key) error(0);
    if (!Array.isArray(entry)) error(1)
    tinify.key = key;
    let config = await loadConfigFile(RECORD_CACHE_FILE);
    console.log(config)
    cache = config
    for (let key in entry) {
        let entryPath = entry[key];
        let file = await getFile(entryPath);
        for (let f in file) {
            await handleImage(file[f])
        }
    }
    saveCache()
}

async function handleImage(p) {
    if (cache[p]) return;
    const spinner = ora({ text: `loading ${p}`, color: "yellow" }).start()
    const absolutePath = path.join(cwd(), p)
    let source = tinify.fromFile(absolutePath)
    await source.toFile(absolutePath)
    cache[p] = true
    spinner.succeed()
}

async function getFile(path) {
    path = path.endsWith('/') ? path : path + '/'
    path += '**/*.{png,jpg,jpeg}'
    return await fg(path)
}

async function loadConfigFile(path) {
    const { config } = await loadConfig({
        sources: [{ files: path }]
    })
    return config || {}
}

function saveCache() {
    fs.writeFileSync(path.join(cwd(), RECORD_CACHE_FULL_FILE), JSON.stringify(cache, null, 2))
    console.log('good dog!')
}

function error(code) {
    let errorMessage = {
        0: "Please add the key field to the tiny.config file",
        1: "entry must be an array"
    }
    console.error(errorMessage[code])
    process.exit(1)
}

init()