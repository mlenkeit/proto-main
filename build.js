'use strict'

const fs = require('fs')
const mkdirpStream = require('fs-mkdirp-stream')
const klaw = require('klaw')
const Mustache = require('mustache')
const path = require('path')
const through2 = require('through2')

// stream transformations
const tx = {
  filterForFiles: () => through2.obj(function(item, enc, next) {
    if (!item.stats.isDirectory()) this.push(item)
    next()
  }),
  readFile: () => through2.obj(function(item, enc, next) {
    fs.readFile(item.path, (err, contents) => {
      if (err) return next(err)
      item.contents = contents.toString()
      this.push(item)
      next()
    })
  }),
  appendRelativePath: from => through2.obj(function(item, enc, next) {
    item.relativePath = path.relative(from, item.path)
    this.push(item)
    next()
  }),
  deepCopyItem: () => through2.obj(function(item, enc, next) {
    const copy = JSON.parse(JSON.stringify(item)) // you can do better than this
    this.push(copy)
    next()
  }),
  replacePlaceholder: (packageMapping, annotations) => through2.obj(function(item, enc, next) {
    item.output = item.contents
    // console.log(item.relativePath)

    // Package mapping
    const lines = item.contents.split('\n')
    const originalPackageDeclaration = lines.find(line => /^package .*;$/.test(line));
    const originalPackage = /^package (.*);$/.exec(originalPackageDeclaration)[1]
    const applicablePackageMapping = (packageMapping || []).find(({ from }) => {
      return new RegExp(from).test(originalPackage)
    })
    // console.log('originalPackageDeclaration', originalPackageDeclaration)
    // console.log('originalPackage', originalPackage)
    // console.log('applicablePackageMapping', applicablePackageMapping)
    if (applicablePackageMapping) {
      const newPackage = originalPackage.replace(applicablePackageMapping.from, applicablePackageMapping.to)
      // console.log('newPackage', newPackage)
      const newPackageDeclaration = `package ${newPackage};`
      item.output = item.output.replace(originalPackageDeclaration, newPackageDeclaration)
      // console.log(item.output)
    }
    // console.log('  ')

    // Annotations
    item.output = Mustache.render(item.output, {
      annotations: annotations.join('\n')
    })

    this.push(item)
    next()
  }),
  appendDestPath: dest => through2.obj(function(item, enc, next) {
    item.destPath = path.join(dest, item.relativePath)
    this.push(item)
    next()
  }),
  mkdirpDestPath: () => mkdirpStream.obj((item, cb) => cb(null, path.dirname(item.destPath))),
  writeToDest: dest => through2.obj(function(item, enc, next) {
    fs.writeFile(item.destPath, item.output, err => {
      if (err) return next(err)
      this.push(item)
      next()
    })
  })
}

// putting pieces together
const dir = path.join(__dirname, '/src/proto')
const targets = require('./targets.conf.js')

const base = klaw(dir, { deptLimit: 4 })
    .pipe(tx.filterForFiles())
    .pipe(tx.readFile())
    .pipe(tx.appendRelativePath(dir))

// fan out for each target
targets.forEach(target => {
  base
    .pipe(tx.deepCopyItem())
    .pipe(tx.replacePlaceholder(target.packageMapping, target.annotations))
    .pipe(tx.appendDestPath(target.dest))
    .pipe(tx.mkdirpDestPath())
    .pipe(tx.writeToDest(target.dest))
    .on('data', item => console.log(`[${target.name}] created ${item.destPath}`))
    .on('error', (err, item) => console.error(err));
})