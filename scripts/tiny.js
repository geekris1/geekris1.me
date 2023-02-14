#!/usr/bin/env node
import path from 'path'
import fg from 'fast-glob';
import fs from 'fs/promises'
import ora from 'ora'
import tinify from 'tinify'
import { cwd } from 'node:process'

const RECORD_FILE = 'tiny.cache.json'
const ENTRY_FILE = 'public'
const KEY_FILE = 'tiny.key.json'
let cache = {}

async function init() {
    const key = await readFile(KEY_FILE)
    console.log(key.key)
    tinify.key = key.key
    cache = await loadCache()
    let file = await getFile(ENTRY_FILE);
    for (let f of file) {
        await handleImage(f)
    }
    await saveCache()
    process.exit(0)
}

async function loadCache() {
    const haveCacheFIle = await isFile(RECORD_FILE)
    if (haveCacheFIle) {
        const result = await readFile(RECORD_FILE);
        return result;
    } else {
        return {}
    }
}
async function isFile(p) {
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    let result = await fs.stat(p).catch(() => false)
    return result && result.isFile()
}
async function handleImage(p) {
    if (cache[p]) return;
    const spinner = ora({ text: `loading ${p}`, color: "yellow" }).start()
    const absolutePath = path.join(cwd(), p)
    try {
        let source = tinify.fromFile(absolutePath)
        await source.toFile(absolutePath)
        cache[p] = true
        spinner.succeed()
    } catch (e) {
        console.log("");
        console.log(e);
        process.exit(1)
    }


}

async function getFile(path) {
    path = path.endsWith('/') ? path : path + '/'
    path += '**/*.{png,jpg,jpeg}'
    return await fg(path)
}

async function readFile(p) {
    if (!path.isAbsolute(p)) {
        p = path.join(cwd(), p)
    }
    const fileData = await fs.readFile(p, 'utf-8')
    return JSON.parse(fileData)
}
async function saveCache() {
    await fs.writeFile(RECORD_FILE, JSON.stringify(cache, null, 2))
    console.log("good dog!")
}

await init()


