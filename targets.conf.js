'use strict'

module.exports = [
  {
    name: 'cwa-server',
    dest: 'dist/cwa-server/common/protocols/src/main/proto/app/coronawarn/server/common/protocols/internal',
    packageMapping: [
      { from: /^cwa\.internal$/, to: 'my-internal' },
      { from: /^cwa/, to: 'sap' }
    ],
    annotations: [
      'hello cwa-server'
    ]
  },
  {
    name: 'cwa-app-ios',
    dest: 'dist/cwa-app-ios/proto/resources',
    packageMapping: [
      { from: /^cwa/, to: 'sap-ios' }
    ],
    annotations: [
      'hello cwa-app-ios'
    ]
  },
  {
    name: 'cwa-app-android',
    dest: 'dist/cwa-app-android/Server-Protocol-Buffer/src/main/proto',
    annotations: [
      'hello cwa-app-android'
    ]
  }
]