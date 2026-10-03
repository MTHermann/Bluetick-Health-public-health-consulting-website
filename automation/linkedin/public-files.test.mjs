import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Installation baseline: deliberate future website edits must update this fixture.
const hashes = {
  '.github/workflows/deploy-pages.yml': 'd9340575974e09df8cc94b4acac85b71d2077d504a318543f9c02daf2ff2a20c',
  'blog/clinical-trial-design-and-statistics/index.html': '22226108606b0291706fd55a6ec04e772069e9c4537e8356f1a86e440a4e6466',
  'blog/data-management-best-practices/index.html': '9006a097620ffab52d8308737bf89f3be709b2b80a09225ba0b472a18290987a',
  'blog/epidemiological-study-design/index.html': 'eac79041911f8a0bc0cabd1fe7e47f7bd9e892cbe5e3db57dc635e8e646f0b72',
  'blog/health-economics-cost-effectiveness-analysis/index.html': '56e776c0f9abf889b95025bd7745e82ad8edc854d798a48869cb2b2c674c3e20',
  'blog/index.html': '64ef260d7c1ea50a4d6dc5a11ca136654decf70eb0fcbbb72b126c15bc202505',
  'blog/redcap-implementation-guide/index.html': 'aecd613f74fd9513e25c93cb7c7c7da9a9c947422f2dffa31d4a695e13161d42',
  'blog/regression-analysis-methods-health-data/index.html': '24ae4b3247151427dd1d4a219e243774481db189040eb94a547aec9edca94d53',
  'blog/survival-analysis-clinical-research/index.html': '07d0e0a8d6e780b0f06df72844c914e4b3661a8c81615e477bea893a6c990621',
  'blog/time-series-analysis-public-health-monitoring/index.html': 'c594ce2301b6d70dad60072cb4f74e225a82eb52d4b734e4f31fb0199143a664',
  'faq/index.html': '5835e25340255af5651a34dbe5da36bacf83d8c0d6f912b78eb2d60ae192d962',
  'index.html': '0d1377e557e60a6cce6525f8adaa2685db7dd29260be3708f705a663c7f4867b',
  'news/index.html': 'f6a1a3914fe9d8984f900a2033d930e462a0acc018774292637a1de3c414683b',
  'package-lock.json': '19663372e0b08e82e851d4f3a0ff5b8321368fb346b541912830d3c18ccfada1',
  'package.json': '5964abdd182468ebd07b3bc8ef50c782e0fd467259cf6bd22b7565734f7ad562',
  'products/index.html': 'aa51bf648882c1ff055b4c427086ffe488c9367bdbebe2c15590cba73a7131d0',
  'public/apple-touch-icon.png': 'a83a3208e3fdddc7fa80e6c6770343bf7acf0e4e6c5e52eb957a383d82a1098c',
  'public/assets/bluetick-globe.png': 'c18510f34345ecf8bb711b94e68b71a4e848ca2f265055bf42e47b01395c31db',
  'public/assets/bluetick-globe.png.png': 'c18510f34345ecf8bb711b94e68b71a4e848ca2f265055bf42e47b01395c31db',
  'public/assets/bluetick-globe.svg': '6041eff8552da9474da0ea57adf7c1a7e5b2e402064a872b2849a2952677522b',
  'public/assets/code-bg-r-bar.svg': 'd93a704cae70f644b4cc482dd3a25afd72c2b78870fa00a0041ef76ac8881fe4',
  'public/assets/code-bg-r-survival.svg': '09afc2c2714780132011a2d6b7512123b8fec8909590622496c19efbc79ae39f',
  'public/assets/code-bg-r-timeseries-map.svg': 'e793cb55130725bf714617b494681757d4634ad1490f01717f1dbe7cb2f1b160',
  'public/assets/code-bg-stata-regression.svg': 'e9386e21265992c84a178dbc17a2b37b4030e93b1d343c2e51be6c889fefeb0a',
  'public/assets/code-bg-stata-survival.svg': '6588b3b5f9bce288c0b8ee89b86cd61d084cc9565caf7cfd8a5c7069a9f13537',
  'public/favicon-16x16.png': '9cc2475b227a8c89869f318be16e2141ff706ee8a4e75c36c274d061bb488dc9',
  'public/favicon-32x32.png': '873e510655e53c17e11e744d5c178cdf53f2204dd63b660564564b146061520b',
  'public/favicon.ico': '988a0401d08462c290729ef25e52f0cad27b3f597532c3759c88c3aaecb3d1b6',
  'public/linkedin-content-strategy.txt': 'ae102453aba8df54cad7f4531adb7513146a1bd6a703838603758f62164ca01f',
  'public/robots.txt': 'd92509eb7a55acfafebc7ca90c8b4cc0e767a7579b62a7f7b0ffca5b9d8f9e96',
  'public/site.webmanifest': '4d6078c0666efd6d894e54d782e992f5a6a050f927fe2b88412bd4b4923f3eee',
  'public/sitemap.xml': '68e3c01e650f3b01a4c3b142f102ecb15e231327350721493529bd0eae3821d5',
  'resources/index.html': '90d0d45e9bc59c09048221d71e0ad780b2ac74cb1f5fa3f62b57b7d33bf66c5f',
  'src/App.jsx': '7db67365907542705009c6239c170df40c32f759e6fc7dde7a883837352c2d0a',
  'src/components/ui/button.jsx': '13e3a0bc245206a2d04cd4d1d757efce809d2c93d5e423f369a8f74bd7fa788f',
  'src/components/ui/card.jsx': '7b0f72e2f30f49c7cdc14cb3424ffdac8ac0b4a252476c022f27a44d67c25860',
  'src/content/siteContent.js': '312839b2ae13bda82ef47269924693a5bc93918fd0d7ab6d985997e62e365828',
  'src/index.css': '44dd41167304032732ce64a9fe7f83a8546686091c902d978ff34e8b89507944',
  'src/main.jsx': 'dfe7f7d0a5d86fe1ab508f0eb8608eb46efeba6819f9bd8ade68d9af6873a739',
  'src/pages/ConsultingWebsite.jsx': 'fbfc8191d5eb045e9d4a542647bc2514e4684f51da66899b87d7fa2bb6633b7b',
  'vacancies/index.html': '7c79f6ab498415458cba424c5a789d327a53b08353d6f31e71b96390285b9eb5',
  'vite.config.js': '52adfa4716d9f55284827015d982abb6b062de86c45c292f52d7c910c2e0e10b',
}

test('existing public website and deployment inputs remain byte-for-byte unchanged', async () => {
  for (const [path, expected] of Object.entries(hashes)) {
    const file = new URL(`../../${path}`, import.meta.url)
    const actual = createHash('sha256').update(await readFile(file)).digest('hex')
    assert.equal(actual, expected, path)
  }
})
