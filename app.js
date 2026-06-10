(() => {
  const $ = (sel) => document.querySelector(sel);
  const form = $('#cvForm');

  const escapeHtml = (s) => {
    if (s === null || s === undefined) return '';
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '<')
      .replaceAll('>', '>')
      .replaceAll('"', '"')
      .replaceAll("'", '&#039;');
  };

  const joinCommaList = (txt) => {
    const s = (txt || '').toString().trim();
    if (!s) return '';
    // Kullanıcı virgülle ayırdıysa, satır satır değil düz liste olarak kalsın.
    // PDF/ATS için noktalı liste de uygun; burada basitçe virgül/tek satır koruyoruz.
    return s.replaceAll(/\s*,\s*/g, ', ');
  };

  const normalizeMultiline = (txt) => (txt || '').toString().trim();

  const getInputValue = (name) => {
    const el = form?.elements?.[name];
    if (!el) return '';
    return el.value;
  };

  // List item builders
  const renderList = (items, container, renderFn) => {
    container.innerHTML = '';
    (items || []).forEach((it, idx) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.appendChild(renderFn(it, idx));
      container.appendChild(node);
    });
  };

  const state = {
    experiences: [],
    education: [],
    certificates: [],
    projects: []
  };

  const experienceTemplate = (it) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="itemTop">
        <div class="badge">${escapeHtml(it.role || 'Rol')}</div>
        <button type="button" class="btn ghost" data-del="exp" title="Sil" style="padding:7px 10px">Sil</button>
      </div>
      <div class="grid2">
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Şirket</div><div style="font-weight:700">${escapeHtml(it.company || '')}</div></div>
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Bitiş / Devam</div><div style="font-weight:700">${escapeHtml(it.end || '')}</div></div>
      </div>
      <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Başlangıç</div><div style="font-weight:700">${escapeHtml(it.start || '')}</div></div>
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Lokasyon</div><div style="font-weight:700">${escapeHtml(it.location || '')}</div></div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:12px;color:rgba(15,35,66,.75)">Açıklama</div>
        <div style="white-space:pre-wrap">${escapeHtml(it.description || '')}</div>
      </div>
    `;
    return wrap;
  };

  const educationTemplate = (it) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="itemTop">
        <div class="badge">${escapeHtml(it.degree || 'Eğitim')}</div>
        <button type="button" class="btn ghost" data-del="edu" title="Sil" style="padding:7px 10px">Sil</button>
      </div>
      <div class="grid2">
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Kurum</div><div style="font-weight:700">${escapeHtml(it.school || '')}</div></div>
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Yıl</div><div style="font-weight:700">${escapeHtml(it.year || '')}</div></div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:12px;color:rgba(15,35,66,.75)">Detay</div>
        <div style="white-space:pre-wrap">${escapeHtml(it.details || '')}</div>
      </div>
    `;
    return wrap;
  };

  const certTemplate = (it) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="itemTop">
        <div class="badge">${escapeHtml(it.title || 'Sertifika')}</div>
        <button type="button" class="btn ghost" data-del="cert" title="Sil" style="padding:7px 10px">Sil</button>
      </div>
      <div class="grid2">
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Kurum</div><div style="font-weight:700">${escapeHtml(it.issuer || '')}</div></div>
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Yıl</div><div style="font-weight:700">${escapeHtml(it.year || '')}</div></div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:12px;color:rgba(15,35,66,.75)">Not</div>
        <div style="white-space:pre-wrap">${escapeHtml(it.note || '')}</div>
      </div>
    `;
    return wrap;
  };

  const projectTemplate = (it) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="itemTop">
        <div class="badge">${escapeHtml(it.name || 'Proje')}</div>
        <button type="button" class="btn ghost" data-del="proj" title="Sil" style="padding:7px 10px">Sil</button>
      </div>
      <div class="grid2">
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Rol</div><div style="font-weight:700">${escapeHtml(it.role || '')}</div></div>
        <div><div style="font-size:12px;color:rgba(15,35,66,.75)">Yıl</div><div style="font-weight:700">${escapeHtml(it.year || '')}</div></div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:12px;color:rgba(15,35,66,.75)">Açıklama</div>
        <div style="white-space:pre-wrap">${escapeHtml(it.description || '')}</div>
      </div>
      <div style="margin-top:10px">
        <div style="font-size:12px;color:rgba(15,35,66,.75)">Link</div>
        <div style="white-space:pre-wrap">${escapeHtml(it.link || '')}</div>
      </div>
    `;
    return wrap;
  };

  const confirmText = (label, placeholder) => {
    const v = prompt(label, placeholder || '');
    return v === null ? null : v;
  };

  const addExperience = () => {
    const role = confirmText('İş unvanı (role):', 'Örn: Frontend Developer');
    if (role === null) return;
    const company = confirmText('Şirket:', 'Örn: ABC Teknoloji');
    if (company === null) return;
    const start = confirmText('Başlangıç (YYYY-MM veya YYYY):', 'Örn: 2022-01');
    if (start === null) return;
    const end = confirmText('Bitiş / Devam:', 'Örn: Devam');
    if (end === null) return;
    const location = confirmText('Lokasyon (opsiyonel):', '');
    if (location === null) return;
    const description = confirmText('Kısa açıklama (opsiyonel):', '');
    if (description === null) return;

    state.experiences.push({ role, company, start, end, location, description });
    sync();
  };

  const addEducation = () => {
    const degree = confirmText('Bölüm / Derece:', 'Örn: Bilgisayar Mühendisliği');
    if (degree === null) return;
    const school = confirmText('Kurum:', 'Örn: Yıldız Teknik Üniversitesi');
    if (school === null) return;
    const year = confirmText('Yıl:', 'Örn: 2020');
    if (year === null) return;
    const details = confirmText('Detay (opsiyonel):', '');
    if (details === null) return;

    state.education.push({ degree, school, year, details });
    sync();
  };

  const addCert = () => {
    const title = confirmText('Sertifika adı:', 'Örn: AWS Cloud Practitioner');
    if (title === null) return;
    const issuer = confirmText('Kurum:', '');
    if (issuer === null) return;
    const year = confirmText('Yıl:', '');
    if (year === null) return;
    const note = confirmText('Not (opsiyonel):', '');
    if (note === null) return;

    state.certificates.push({ title, issuer, year, note });
    sync();
  };

  const addProject = () => {
    const name = confirmText('Proje adı:', 'Örn: ATS CV Builder');
    if (name === null) return;
    const role = confirmText('Rol (opsiyonel):', '');
    if (role === null) return;
    const year = confirmText('Yıl (opsiyonel):', '');
    if (year === null) return;
    const description = confirmText('Açıklama (opsiyonel):', '');
    if (description === null) return;
    const link = confirmText('Link (opsiyonel):', '');
    if (link === null) return;

    state.projects.push({ name, role, year, description, link });
    sync();
  };

  // Attach delete buttons via event delegation
  const listExperience = $('#experienceList');
  const listEducation = $('#educationList');
  const listCert = $('#certList');
  const listProject = $('#projectList');

  const bindDelete = () => {
    const map = [
      { container: listExperience, key: 'experiences', kind: 'exp' },
      { container: listEducation, key: 'education', kind: 'edu' },
      { container: listCert, key: 'certificates', kind: 'cert' },
      { container: listProject, key: 'projects', kind: 'proj' }
    ];

    map.forEach(({ container, key, kind }) => {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-del]');
        if (!btn) return;
        if (btn.getAttribute('data-del') !== kind) return;
        // item index = card order
        const cards = Array.from(container.querySelectorAll('.item'));
        const card = e.target.closest('.item');
        const idx = cards.indexOf(card);
        if (idx < 0) return;
        state[key].splice(idx, 1);
        sync();
      });
    });
  };

  // Outputs
  const out = (attr) => document.querySelector(`[data-out="${attr}"]`);

  const sync = () => {
    const fullName = getInputValue('fullName');
    const email = getInputValue('email');
    const phone = getInputValue('phone');
    const location = getInputValue('location');
    const linkedin = getInputValue('linkedin');
    const portfolio = getInputValue('portfolio');

    const contactPieces = [];
    if (email) contactPieces.push(`E-posta: ${email}`);
    if (phone) contactPieces.push(`Telefon: ${phone}`);
    if (location) contactPieces.push(location);
    const links = [];
    if (linkedin) links.push(`LinkedIn: ${linkedin}`);
    if (portfolio) links.push(`Portfolio: ${portfolio}`);
    if (links.length) contactPieces.push(links.join(' | '));

    const contactLine = contactPieces.join('  |  ');

    const summary = normalizeMultiline(getInputValue('summary'));
    const skills = joinCommaList(getInputValue('skills'));

    const expText = (state.experiences || []).map((x) => {
      const lines = [];
      const header = [x.role, x.company].filter(Boolean).join(' - ');
      if (header) lines.push(header);
      const meta = [x.start, x.end, x.location].filter(Boolean).join(' | ');
      if (meta) lines.push(meta);
      if (x.description) lines.push(x.description);
      return lines.join('\n');
    }).join('\n\n');

    const eduText = (state.education || []).map((x) => {
      const lines = [];
      const header = [x.degree, x.school].filter(Boolean).join(' - ');
      if (header) lines.push(header);
      const meta = [x.year].filter(Boolean).join(' | ');
      if (meta) lines.push(meta);
      if (x.details) lines.push(x.details);
      return lines.join('\n');
    }).join('\n\n');

    const certText = (state.certificates || []).map((x) => {
      const lines = [];
      const header = [x.title, x.issuer].filter(Boolean).join(' - ');
      if (header) lines.push(header);
      const meta = [x.year].filter(Boolean).join(' | ');
      if (meta) lines.push(meta);
      if (x.note) lines.push(x.note);
      return lines.join('\n');
    }).join('\n\n');

    const projText = (state.projects || []).map((x) => {
      const lines = [];
      const header = [x.name].filter(Boolean).join('');
      if (header) lines.push(header);
      const meta = [x.role, x.year].filter(Boolean).join(' | ');
      if (meta) lines.push(meta);
      if (x.description) lines.push(x.description);
      if (x.link) lines.push(x.link);
      return lines.join('\n');
    }).join('\n\n');

    const languages = joinCommaList(getInputValue('languages'));
    const hobbies = joinCommaList(getInputValue('hobbies'));

    if (out('fullName')) out('fullName').textContent = fullName || ' ';
    if (out('contactLine')) out('contactLine').textContent = contactLine || ' ';

    if (out('summary')) out('summary').textContent = summary || ' ';
    if (out('skills')) out('skills').textContent = skills || ' ';
    if (out('experience')) out('experience').textContent = expText || ' ';
    if (out('education')) out('education').textContent = eduText || ' ';
    if (out('certificates')) out('certificates').textContent = certText || ' ';
    if (out('projects')) out('projects').textContent = projText || ' ';
    if (out('languages')) out('languages').textContent = languages || ' ';
    if (out('hobbies')) out('hobbies').textContent = hobbies || ' ';

    // Render list cards
    renderList(state.experiences, listExperience, (it) => experienceTemplate(it));
    renderList(state.education, listEducation, (it) => educationTemplate(it));
    renderList(state.certificates, listCert, (it) => certTemplate(it));
    renderList(state.projects, listProject, (it) => projectTemplate(it));
  };

  // PDF Download: use browser print to PDF.
  // For “real download PDF” without libs, reliable approach is window.print with print CSS.
  const downloadPdfBtn = $('#downloadPdf');
  downloadPdfBtn.addEventListener('click', () => {
    // Hide any interactive panels already handled by @media print in CSS.
    window.print();
  });

  // Optional sample fill
  $('#fillSample').addEventListener('click', () => {
    const set = (name, value) => {
      const el = form.elements[name];
      if (el) el.value = value;
    };
    set('fullName', 'Emir Yılmaz');
    set('email', 'emir.yilmaz@example.com');
    set('phone', '0 5xx xxx xx xx');
    set('location', 'İstanbul, Türkiye');
    set('linkedin', 'https://www.linkedin.com/in/emiryilmaz');
    set('portfolio', 'https://github.com/emiryilmaz');
    set('summary', 'Yazılım geliştirme alanında deneyimliyim. ATS uyumlu CV hazırlama ve modern web uygulamaları geliştirme üzerine çalışıyorum. Temiz kod, test ve performans odaklı geliştirmeler yaparım.');
    set('skills', 'JavaScript, TypeScript, React, Node.js, REST API, SQL, Git');
    set('languages', 'Türkçe (Ana dil), İngilizce (B2)');
    set('hobbies', 'Spor, Okuma, Teknoloji');

    state.experiences = [
      { role: 'Frontend Developer', company: 'ABC Teknoloji', start: '2022-01', end: 'Devam', location: 'İstanbul', description: 'React tabanlı arayüzler geliştirdim. Performans iyileştirmeleri yaptım.' }
    ];
    state.education = [
      { degree: 'Bilgisayar Mühendisliği', school: 'Örnek Üniversitesi', year: '2020', details: 'Gömülü sistemler ve yazılım mühendisliği dersleri.' }
    ];
    state.certificates = [
      { title: 'AWS Cloud Practitioner', issuer: 'AWS', year: '2021', note: '' }
    ];
    state.projects = [
      { name: 'ATS CV Builder', role: 'Frontend', year: '2024', description: 'Tarayıcıda ATS uyumlu CV oluşturma ve PDF çıktısı alma.', link: 'https://ornek.com' }
    ];

    sync();
  });

  // Reset
  $('#resetBtn').addEventListener('click', () => {
    form.reset();
    state.experiences = [];
    state.education = [];
    state.certificates = [];
    state.projects = [];
    sync();
  });

  // Add buttons
  $('#addExperience').addEventListener('click', addExperience);
  $('#addEducation').addEventListener('click', addEducation);
  $('#addCert').addEventListener('click', addCert);
  $('#addProject').addEventListener('click', addProject);

  form.addEventListener('input', () => {
    sync();
  });

  bindDelete();
  sync();
})();

