const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');

const matakuliahRoutes = require('./routes/matakuliahRoutes');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const dosenRoutes = require('./routes/dosenRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kelasRoutes = require('./routes/kelasRoutes');

// Inisialisasi express app
const app = express();
app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing form data

// Konfigurasi Handlebars sebagai view engine
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    inc: (value) => parseInt(value) + 1,
    isSelected: (a, b) => {
      // Inline helper to return "selected" attribute if values match
      return String(a) === String(b) ? 'selected' : '';
    },
    isChecked: (arr, val) => {
      // Inline helper to return "checked" attribute if value is in array
      if (!arr) return '';
      const arrValues = arr.map(v => String(v));
      return arrValues.includes(String(val)) ? 'checked' : '';
    },
    eq: function(a, b, options) {
      // Works as both block helper and inline helper
      const isEqual = String(a) === String(b);
      if (options && typeof options.fn === 'function') {
        // Block helper context: {{#eq a b}}...{{/eq}}
        return isEqual ? options.fn(this) : options.inverse(this);
      } else {
        // Inline helper context: {{#if (eq a b)}}...{{/if}}
        return isEqual;
      }
    },
    inArray: function(arr, val, options) {
      // Works as both block helper and inline helper
      if (!arr) {
        if (options && typeof options.fn === 'function') {
          return options.inverse(this);
        }
        return false;
      }
      const arrValues = arr.map(v => String(v));
      const isIncluded = arrValues.includes(String(val));
      if (options && typeof options.fn === 'function') {
        // Block helper context: {{#inArray arr val}}...{{/inArray}}
        return isIncluded ? options.fn(this) : options.inverse(this);
      } else {
        // Inline helper context: {{#if (inArray arr val)}}...{{/if}}
        return isIncluded;
      }
    }
  }
}))

// Set view engine ke Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// load bootstrap dari node_modules
app.use('/bootstrap', 
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist'))
);


// Buat route ke root /
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.use("/mata-kuliah",matakuliahRoutes);
app.use("/mahasiswa",mahasiswaRoutes);
app.use("/dosen",dosenRoutes);
app.use("/admin",adminRoutes);
app.use("/kelas",kelasRoutes);

// jalankan server di port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});