// screens/hospital-info.js — comprehension experience: informational
// pages linked from the home nav (about / services / contact). All of
// them share the hospital chrome so every linked page looks the same.

import { getSession } from '../../../session/session.js';
import { getExperienceById } from '../../../data/experiences.js';
import { pickCopy, infoPages } from '../data/copy.js';
import { hospitalChrome, bindHospitalNav } from '../components/hospital-shell.js';
import { navigate } from '../../../router.js';

export function renderHospitalInfo(container, section) {
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  if (!session || experience?.id !== 'comprehension') {
    window.location.hash = '#/experiences';
    return;
  }
  const page = infoPages[section];
  if (!page) {
    navigate('#/hospital');
    return;
  }
  const plain = session.plainMode === true;
  const pick = (entry) => (plain ? entry.plain : entry.obf);

  container.innerHTML = `
    <div class="hospital-app">
      <h1 class="sr-only">${pick(page.title)}</h1>
      ${hospitalChrome((key) => pickCopy(key, plain), plain)}
      <main class="hospital-main hospital-info" id="main-content">
        <section class="hospital-hero" aria-labelledby="hospital-info-title">
          <h2 id="hospital-info-title">${pick(page.title)}</h2>
          <img class="hospital-img hospital-hero-img" src="${page.img}" alt="" />
          ${page.paras.map((p) => `<p>${pick(p)}</p>`).join('')}
          ${
            page.list
              ? `<ul class="hospital-info-list">
                  ${page.list.map((i) => `<li>${pick(i)}</li>`).join('')}
                </ul>`
              : ''
          }
        </section>
      </main>
    </div>
  `;
  bindHospitalNav(container);
}
