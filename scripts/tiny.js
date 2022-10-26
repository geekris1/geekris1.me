#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs/promises'
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'

const RECORD_CACHE_FULL_FILE = 'tiny.cache.json'
const RECORD_PATH = path.join(cwd(), RECORD_CACHE_FULL_FILE)
const ENTRY_PATH = 'public'
const KEY_FILE = 'tiny.key.json'
let cache = {}

async function init() {
    const key = await readFile(KEY_FILE)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_PATH);
    for (let f of file) {
        await handleImage(f)
    }
    await saveCache()
    process.exit(0)
}

async function loadCache() {
    const haveCacheFIle = await isFile(RECORD_PATH)
    if (haveCacheFIle) {
        const result = await readFile(RECORD_PATH);
        return result;
    } else {
        return {}
    }
}
async function isFile(p) {
    let result = await haveCache(p)
    return result && result.isFile()
}
async function haveCache(p) {
    let result = await fs.stat(p).catch(() => false)
    return result
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

async function readFile(p) {
    const flag = path.isAbsolute(p)
    if (!flag) {
        p = path.join(cwd(), p)
    }
    const fileData = await fs.readFile(p, 'utf-8')
    const result = JSON.parse(fileData)
    return result;

}
async function saveCache() {
    await fs.writeFile(RECORD_PATH, JSON.stringify(cache, null, 2))
    console.log("good dog!")

}

await init()