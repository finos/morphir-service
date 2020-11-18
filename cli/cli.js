'use strict'

// NPM imports
const path = require('path')
const util = require('util')
const fs = require('fs')
const readdir = util.promisify(fs.readdir)
const mkdir = util.promisify(fs.mkdir)
const readFile = util.promisify(fs.readFile)
const fsWriteFile = util.promisify(fs.writeFile)

// Elm imports
const worker = require('./Morphir.Elm.CLI').Elm.Morphir.Elm.CLI.init()

async function gen(input, outputPath, options) {
    await mkdir(outputPath, { recursive: true })
    const morphirIrJson = await readFile(path.resolve(input))
    const fileMap = await generate(options, JSON.parse(morphirIrJson.toString()))
    const sourceDirectory = path.join(path.dirname(__dirname), `/redistributable/${options["target"]}/`)

    const writePromises =
        fileMap.map(async ([[dirPath, fileName], content]) => {
            const fileDir = dirPath.reduce((accum, next) => path.join(accum, next), outputPath)
            const filePath = path.join(fileDir, fileName)
                if (await fileExist(filePath)) {
                console.log(`UPDATE - ${filePath}`)
            } else {
                    await mkdir(fileDir, {recursive: true})
                    console.log(`INSERT - ${filePath}`)
            }
            return fsWriteFile(filePath, content)
        })
    // SSG temp end
    // const filesToDelete = await findFilesToDelete(outputPath, fileMap)
    // const deletePromises =
    //     filesToDelete.map(async (fileToDelete) => {
    //         console.log(`DELETE - ${fileToDelete}`)
    //         return fs.unlinkSync(fileToDelete)
    //     })
    // SSG temp end
    const copyDirectoriesRecursive = await copyRecursiveSync(sourceDirectory, outputPath)
    // return Promise.all(writePromises.concat(deletePromises))
    return Promise.all(writePromises) //SSG temp
}

async function copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src);
    if(exists)
    {
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();
        if (isDirectory) {
            if(!fs.existsSync(dest))
                fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function(childItemName) {
                copyRecursiveSync(path.join(src, childItemName),
                    path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

async function generate(options, ir) {
    return new Promise((resolve, reject) => {
        worker.ports.decodeError.subscribe(err => {
            reject(err)
        })

        worker.ports.generateResult.subscribe(([err, ok]) => {
            if (err) {
                reject(err)
            } else {
                resolve(ok)
            }
        })

        worker.ports.generate.send([options, ir])
    })
}

async function fileExist(filePath) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.F_OK, (err) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    });
}

async function findFilesToDelete(outputPath, fileMap) {
    const readDir = async function (currentDir, generatedFiles) {
        const entries = await readdir(currentDir, { withFileTypes: true })
        const filesToDelete =
            entries
                .filter(entry => {
                    const entryPath = path.join(currentDir, entry.name)
                    return entry.isFile() && !generatedFiles.includes(entryPath)
                })
                .map(entry => path.join(currentDir, entry.name))
        const subDirFilesToDelete =
            entries
                .filter(entry => entry.isDirectory())
                .map(entry => readDir(path.join(currentDir, entry.name), generatedFiles))
                .reduce(async (soFarPromise, nextPromise) => {
                    const soFar = await soFarPromise
                    const next = await nextPromise
                    return soFar.concat(next)
                }, Promise.resolve([]))
        return filesToDelete.concat(await subDirFilesToDelete)
    }

    const files =
        fileMap.map(([[dirPath, fileName], content]) => {
            const fileDir = dirPath.reduce((accum, next) => path.join(accum, next), outputPath)
            return path.resolve(fileDir, fileName)
        })
    return Promise.all(await readDir(outputPath, files))
}

async function writeFile(filePath, content) {
    await mkdir(path.dirname(filePath), { recursive: true })
    return await fsWriteFile(filePath, content)
}

exports.gen = gen;
exports.writeFile = writeFile;