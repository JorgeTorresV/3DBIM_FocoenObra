import resolve from '@rollup/plugin-node-resolve';
export default [{
  input: 'main/src/app.js',
  output: [
    {
      format: 'esm',
      file: 'main/bundle/bundle.js',      
    },
  ],
  plugins: [
    resolve()    
  ]
},
{
  input: 'main/src/gis.js',
  output: [
    {
      format: 'esm',
      file: 'main/bundle/gis.js',
    },
  ],
  plugins: [
    resolve()    
  ]
}
];