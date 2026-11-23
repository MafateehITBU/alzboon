import { normalizeLocale } from './locale.js'

const messages = {
  en: {
    nav: {
      home: 'Home',
      about: 'About Us',
      services: 'Services',
      contact: 'Contact Us',
      blogs: 'Blogs',
      privacy: 'Privacy Policy',
    },
    home: {
      languageLabel: 'Switch language',
      forMoreDetails: 'For more details',
      bookConsultation: 'Book A Consultation',
      instantWhatsapp: 'Instant WhatsApp',
      hero: {
        eyebrow: 'OVER 25 YEARS OF LEGAL EXPERIENCE',
        titleLine1: 'Legal Expertise.',
        titleLine2: 'Strategic Vision.',
        body: 'We provide innovative consultancy and effective legal solutions, empowering our clients to achieve sustainable success and protect their intellectual and organizational rights.',
        contact: 'Contact Us',
        profile: 'View Our Profile',
        legacy: 'A LEGACY OF LEGAL EXPERTISE',
        videoLabel: 'Awwad Alzboon legal consultancy introduction',
      },
      practice: {
        eyebrow: 'Disciplines & Retainers',
        title: 'Awaad Alzboon Legal Practice Areas',
        description:
          'At Awaad Alzboon Consultancy, we offer a comprehensive range of legal and administrative services, specifically designed to meet the needs of individuals and companies across 12 core disciplines.',
        fallbacks: [
          {
            id: 'dispute-defense',
            eyebrow: 'INTELLECTUAL PROPERTY',
            title: 'Dispute & Defense',
            body: 'Strategic legal representation in intellectual property disputes, including infringement claims, enforcement, and defense.',
          },
          {
            id: 'corporate-finance',
            eyebrow: 'CORPORATE & FINANCIAL ADVISORY',
            title: 'Corporate & Finance',
            body: 'Legal support for corporate structures, commercial contracts, financing arrangements, and business transactions.',
          },
          {
            id: 'ip-regulatory',
            eyebrow: 'INTELLECTUAL PROPERTY & COMPLIANCE',
            title: 'IP & Regulatory',
            body: 'Legal guidance on intellectual property, data protection, regulatory compliance, and risk management.',
          },
        ],
      },
      approach: {
        eyebrow: 'Our Approach',
        title: 'A different kind of law firm, built for global institutions.',
        statement:
          'Traditional law firms are structured around billing hours. Our model is structured around client outcomes.',
        steps: [
          { number: '01', title: 'Fully Aligned With Our Clients' },
          { number: '02', title: 'Highest Quality, Faster and More Reliable' },
          { number: '03', title: 'The Future of Legal Practice' },
        ],
      },
      expertise: {
        noteLabel: 'Executive Counsel Note',
        noteQuote: 'Protecting enterprise intellect and operational sovereignty across global markets.',
        wipo: 'WIPO',
        wipoSub: 'Registered',
        arbitration: 'Commercial',
        arbitrationSub: 'Arbitration',
        countries: '40+',
        countriesSub: 'Countries',
        portraitAlt: 'Counsel reviewing documents at a desk',
        eyebrow: 'Authority & Foresight',
        title: 'Deep Expertise and a Vision for the Future',
        body1:
          'With over 25 years of experience in providing successful and diverse consultancy services, we take pride in our ability to offer our clients deep strategic insights that help them make informed decisions to enhance their future growth.',
        body2:
          'We work closely with each client to understand their unique challenges and needs, enabling us to develop innovative and tailored solutions that align with their goals. From safeguarding nascent industrial inventions to stewarding intricate international trademarks and resolving complex institutional restructuring, our advisory framework is built on uncompromising diligence.',
        governanceTitle: 'Institutional Governance',
        governanceBody: 'Robust legal compliance and executive decision safeguarding.',
        crossBorderTitle: 'Cross-Border Protection',
        crossBorderBody: 'Madrid Protocol, PCT national phase filings, and multi-region enforcement.',
      },
      testimonials: {
        eyebrow: 'Client Validation',
        title: 'Recognized by Leading Enterprises',
        description: 'Over two decades of discretion, landmark resolutions, and fortified brand equity.',
        reviews: [
          {
            label: 'Verified Counsel',
            quote:
              "Awaad Alzboon's strategic oversight of our regional trademark portfolio prevented multiple infringement challenges. His command of intellectual property laws is unmatched.",
            company: 'NexaCore Industries',
            descriptor: 'Industrial & Technology Group',
          },
          {
            label: 'Corporate M&A',
            quote:
              'Their precision in contract drafting and corporate structuring facilitated our recent cross-border acquisition with absolute regulatory clarity and speed.',
            company: 'Aurelia Ventures',
            descriptor: 'Investment & Business Development',
          },
          {
            label: 'Patent Defense',
            quote:
              "When facing severe patent disputes, Counsel Alzboon delivered robust strategic guidance that protected our company's core technological innovations.",
            company: 'Meridian Global Holdings',
            descriptor: 'International Business Group',
          },
        ],
      },
      consultation: {
        eyebrow: 'We are here to serve you and meet your needs',
        title: 'Consult With Our Senior Legal Advisors Today',
        body: "Gain the strategic clarity and legal certainty required to accelerate your enterprise's trajectory. Direct consultations available via WhatsApp or structured retainer.",
      },
      footer: {
        blurb:
          'Senior Legal Counsel & Strategic Advisory. IP protection, corporate advisory, and cross-border dispute resolution for ambitious businesses.',
        trademarkAgent: 'Certified Trademark Agent',
        arbitrator: 'Licensed Arbitrator',
        company: 'Company',
        getInTouch: 'Get in Touch',
        briefs: 'Judicial Briefs',
        briefsBody: 'Receive quarterly regulatory alerts and high-level strategic legal updates.',
        emailPlaceholder: 'counsel@enterprise.com',
        emailLabel: 'Email address',
        subscribe: 'Subscribe to Briefs',
        invalidEmail: 'Enter a valid email address.',
        subscribeOffline: 'This form is not connected to a mailing service. No subscription was created.',
        address: 'Al Muroor Road, Abu Dhabi, United Arab Emirates',
      },
    },
    services: {
      title: 'Services',
      megaHeading: 'Our Practice Areas',
      viewAll: 'View all',
      description: 'Explore our available legal consultancy services.',
      empty: 'No services are available yet.',
      back: 'Back to services',
      practiceAreas: 'Practice areas',
      benefits: 'Benefits',
      overview: 'Overview',
    },
    blogs: {
      title: 'Blogs',
      description: 'Insights and updates from Awwad AlZboon.',
      empty: 'No published articles are available yet.',
      back: 'Back to blogs',
      allCategories: 'All categories',
      by: 'By',
      in: 'in',
      previous: 'Previous',
      next: 'Next',
    },
    contact: {
      title: 'Contact Us',
      description: 'Send an enquiry to our team. We will respond as soon as possible.',
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      country: 'Country',
      service: 'Service',
      serviceOptional: 'Select a service (optional)',
      message: 'Message',
      submit: 'Send enquiry',
      sending: 'Sending…',
      success: 'Thank you. Your enquiry was received.',
      error: 'Your enquiry could not be sent. Please try again.',
      rateLimited: 'Too many enquiries were sent recently. Please try again later.',
      invalid: 'Please check the highlighted fields and try again.',
      invalidService: 'Choose a valid available service, or leave the service blank.',
    },
    about: {
      title: 'About Us',
      metaDescription:
        'Architecting legal certainty across borders and enterprise. Learn about Counselor Awaad Alzboon, senior counsel and founder of Awwad AlZboon Legal Consultancy.',
      breadcrumbHome: 'HOME',
      breadcrumbCurrent: 'ABOUT US',
      heroTitle: 'Architecting Legal Certainty Across Border & Enterprise',
      heroTitleParts: [
        { text: 'Architecting Legal Certainty ', accent: false },
        { text: 'Across ', accent: false, glueNext: true },
        { text: 'Border & Enterprise', accent: true },
      ],
      heroBody:
        'Founded on rigorous jurisprudence, specialized intellectual property enforcement, and commercial acumen. Serving visionary corporations, innovators, and sovereign family offices across Jordan, the GCC, and international jurisdictions.',
      heroCards: [
        {
          title: 'Licensed Arbitrator',
          body: 'Commercial tribunals & dispute mediation',
        },
        {
          title: 'Certified IP Agent',
          body: 'WIPO & Madrid System accredited',
        },
      ],
      stats: [
        {
          label: 'TENURE',
          value: '25+',
          description: 'Years of Proven Advisory Leadership',
        },
        {
          label: 'PORTFOLIO',
          value: '1,200+',
          description: 'Cases, Briefs & Filings Managed',
        },
        {
          label: 'REACH',
          value: '40+',
          description: 'Jurisdictions via Madrid & WIPO',
        },
        {
          label: 'FIDUCIARY TRUST',
          value: '98%',
          description: 'Retained Client Loyalty Index',
        },
      ],
      founderEyebrow: 'EXECUTIVE BIO & JUDICIAL MANDATE',
      founderHeading: 'A Quarter Century of Unwavering Sovereignty & Defense',
      founderRole: 'SENIOR COUNSEL & FOUNDER',
      founderName: 'Awaad Alzboon',
      founderCredentials: 'Licensed Arbitrator • Certified Patent & Trademark Agent',
      founderPortraitAlt: 'Counselor Awaad Alzboon, Senior Counsel and Founder',
      founderBio1:
        'For over 25 years, Counselor Awaad Alzboon has served as confidential legal strategist and senior advocate to high-growth enterprises, multinational conglomerates, governmental authorities, and pioneer tech ventures. His practice bridges continental civil legal codifications with complex Anglo-American cross-border transactions.',
      founderBio2:
        'Renowned for his strategic agility in high-stakes intellectual property dispute resolution and multi-million-dollar contractual architectures, Counselor Alzboon has represented clients before high appellate courts, ministerial chambers, and private arbitral tribunals across Jordan and the broader GCC economic sphere.',
      founderQuote:
        'Protecting enterprise intellect and operational sovereignty across global markets requires not merely knowledge of statutes, but strategic foresight and unyielding precision.',
      founderAttribution: 'Counselor Awaad Alzboon',
      credentialsHeading: 'BAR ADMISSIONS & OFFICIAL ACCREDITATIONS',
      credentials: [
        {
          title: 'Jordan Bar Association',
          body: 'Full Judicial Advocacy Rights',
        },
        {
          title: 'WIPO Representative',
          body: 'Global IP Registry Delegate',
        },
        {
          title: 'International Arbitration Bar',
          body: 'Certified Dispute Arbitrator',
        },
        {
          title: 'Madrid System Counsel',
          body: 'Multilateral Trademark Agent',
        },
      ],
      ctaLabel: 'CONFIDENTIAL ENGAGEMENT',
      ctaTitle: 'Engage Our Counsel for Your Next Strategic Milestone',
      ctaTitleLines: [
        [{ text: 'Engage Our Counsel for Your Next', accent: false }],
        [{ text: 'Strategic Milestone', accent: true }],
      ],
      ctaBody:
        'Whether safeguarding novel proprietary technologies, structuring an overseas subsidiary, or arbitrating complex partnership disputes, our team provides sovereign legal clarity.',
      ctaPrimary: 'Book Structured Consultation',
      ctaWhatsapp: 'Direct WhatsApp Counsel',
      ctaNote: 'Protected under strict Jordan Bar Attorney-Client Confidentiality Statutes.',
    },
    privacy: {
      title: 'Privacy Policy',
      body: 'We collect enquiry details you submit through this website to respond to your request. Admin access to those records is restricted. Contact us if you need help with personal data held in an enquiry.',
    },
    notFound: {
      title: 'Page not found',
      body: 'The page you requested is not available.',
      home: 'Back to home',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      about: 'من نحن',
      services: 'الخدمات',
      contact: 'تواصل معنا',
      blogs: 'المدونة',
      privacy: 'سياسة الخصوصية',
    },
    home: {
      languageLabel: 'تبديل اللغة',
      forMoreDetails: 'لمزيد من التفاصيل',
      bookConsultation: 'احجز استشارة',
      instantWhatsapp: 'واتساب فوري',
      hero: {
        eyebrow: 'أكثر من 25 عاماً من الخبرة القانونية',
        titleLine1: 'خبرة قانونية.',
        titleLine2: 'ورؤية استراتيجية.',
        body: 'نقدّم استشارات مبتكرة وحلولاً قانونية فعّالة، نمكّن عملاءنا من تحقيق نجاح مستدام وحماية حقوقهم الفكرية والمؤسسية.',
        contact: 'تواصل معنا',
        profile: 'اطّلع على ملفنا',
        legacy: 'إرثٌ من الخبرة القانونية',
        videoLabel: 'مقدمة عن استشارات عواد الزبون القانونية',
      },
      practice: {
        eyebrow: 'التخصصات والتعاقدات',
        title: 'مجالات الممارسة القانونية لدى عواد الزبون',
        description:
          'في استشارات عواد الزبون نقدّم مجموعة متكاملة من الخدمات القانونية والإدارية، مصمَّمة لتلبية احتياجات الأفراد والشركات عبر اثني عشر تخصصاً أساسياً.',
        fallbacks: [
          {
            id: 'dispute-defense',
            eyebrow: 'الملكية الفكرية',
            title: 'المنازعات والدفاع',
            body: 'تمثيل قانوني استراتيجي في منازعات الملكية الفكرية، بما يشمل دعاوى التعدي والإنفاذ والدفاع.',
          },
          {
            id: 'corporate-finance',
            eyebrow: 'الاستشارات المؤسسية والمالية',
            title: 'الشركات والتمويل',
            body: 'دعم قانوني للهياكل المؤسسية والعقود التجارية وترتيبات التمويل والمعاملات التجارية.',
          },
          {
            id: 'ip-regulatory',
            eyebrow: 'الملكية الفكرية والامتثال',
            title: 'الملكية الفكرية والشؤون التنظيمية',
            body: 'إرشاد قانوني في الملكية الفكرية وحماية البيانات والامتثال التنظيمي وإدارة المخاطر.',
          },
        ],
      },
      approach: {
        eyebrow: 'نهجنا',
        title: 'مكتب محاماة من طراز مختلف، مبني لخدمة المؤسسات العالمية.',
        statement:
          'تعتمد مكاتب المحاماة التقليدية على احتساب ساعات العمل. أما نموذجنا فيرتكز على تحقيق نتائج ملموسة لعملائنا.',
        steps: [
          { number: '01', title: 'توافق تام مع مصالح عملائنا' },
          { number: '02', title: 'أعلى جودة بسرعة وموثوقية أكبر' },
          { number: '03', title: 'مستقبل الممارسة القانونية' },
        ],
      },
      expertise: {
        noteLabel: 'ملاحظة المستشار التنفيذي',
        noteQuote: 'حماية ملكية المؤسسة الفكرية وسيادتها التشغيلية عبر الأسواق العالمية.',
        wipo: 'الويبو',
        wipoSub: 'مسجّل',
        arbitration: 'تحكيم',
        arbitrationSub: 'تجاري',
        countries: '+40',
        countriesSub: 'دولة',
        portraitAlt: 'مستشار يراجع مستندات على مكتبه',
        eyebrow: 'سلطة واستشراف',
        title: 'خبرة عميقة ورؤية للمستقبل',
        body1:
          'بخبرة تمتد لأكثر من خمسة وعشرين عاماً في تقديم استشارات ناجحة ومتنوعة، نفخر بقدرتنا على تزويد عملائنا برؤى استراتيجية عميقة تساعدهم على اتخاذ قرارات واعية تعزّز نموهم المستقبلي.',
        body2:
          'نعمل عن قرب مع كل عميل لفهم تحدياته واحتياجاته الخاصة، بما يمكّننا من تطوير حلول مبتكرة ومصمَّمة وفق أهدافه. من حماية الاختراعات الصناعية الناشئة إلى إدارة العلامات التجارية الدولية المعقّدة ومعالجة إعادة الهيكلة المؤسسية المعقّدة، يرتكز إطارنا الاستشاري على عناية لا تقبل المساومة.',
        governanceTitle: 'الحوكمة المؤسسية',
        governanceBody: 'امتثال قانوني راسخ وحماية للقرارات التنفيذية.',
        crossBorderTitle: 'الحماية عبر الحدود',
        crossBorderBody: 'بروتوكول مدريد، والمرحلة الوطنية لمعاهدة التعاون بشأن البراءات، والإنفاذ متعدد المناطق.',
      },
      testimonials: {
        eyebrow: 'ثقة العملاء',
        title: 'معترف بها من أبرز المؤسسات',
        description: 'أكثر من عقدين من السرية المهنية، والحلول المفصلية، وتعزيز قيمة العلامات التجارية.',
        reviews: [
          {
            label: 'استشارة موثّقة',
            quote:
              'ساهم الإشراف الاستراتيجي لعواد الزبون على محفظة علاماتنا التجارية الإقليمية في تفادي تحديات تعدٍّ متعددة. وإلمامه بقوانين الملكية الفكرية لا يُضاهى.',
            company: 'NexaCore Industries',
            descriptor: 'مجموعة صناعية وتقنية',
          },
          {
            label: 'عمليات الاندماج والاستحواذ',
            quote:
              'أتاحت دقّتهم في صياغة العقود وهيكلة الشركات إنجاز استحواذنا العابر للحدود مؤخراً بوضوح تنظيمي تام وسرعة عالية.',
            company: 'Aurelia Ventures',
            descriptor: 'الاستثمار وتطوير الأعمال',
          },
          {
            label: 'الدفاع عن براءات الاختراع',
            quote:
              'عند مواجهة منازعات براءات اختراع حادة، قدّم المستشار الزبون توجيهاً استراتيجياً راسخاً حمى الابتكارات التقنية الجوهرية لشركتنا.',
            company: 'Meridian Global Holdings',
            descriptor: 'مجموعة أعمال دولية',
          },
        ],
      },
      consultation: {
        eyebrow: 'نحن هنا لخدمتكم وتلبية احتياجاتكم',
        title: 'استشيروا مستشارينا القانونيين الكبار اليوم',
        body: 'احصلوا على الوضوح الاستراتيجي واليقين القانونية اللازمة لتسريع مسار مؤسستكم. استشارات مباشرة عبر واتساب أو تعاقد منظم.',
      },
      footer: {
        blurb:
          'استشارات قانونية عليا وإرشاد استراتيجي. حماية الملكية الفكرية، والاستشارات المؤسسية، وتسوية المنازعات العابرة للحدود للشركات الطموحة.',
        trademarkAgent: 'وكيل علامات تجارية معتمد',
        arbitrator: 'محكّم مرخّص',
        company: 'الشركة',
        getInTouch: 'تواصل معنا',
        briefs: 'النشرات القضائية',
        briefsBody: 'احصلوا على تنبيهات تنظيمية ربع سنوية وتحديثات قانونية استراتيجية رفيعة المستوى.',
        emailPlaceholder: 'counsel@enterprise.com',
        emailLabel: 'البريد الإلكتروني',
        subscribe: 'اشترك في النشرات',
        invalidEmail: 'يرجى إدخال بريد إلكتروني صالح.',
        subscribeOffline: 'هذا النموذج غير متصل بخدمة بريدية. لم يتم إنشاء أي اشتراك.',
        address: 'طريق المرور، أبوظبي، الإمارات العربية المتحدة',
      },
    },
    services: {
      title: 'الخدمات',
      megaHeading: 'مجالات ممارستنا',
      viewAll: 'عرض الكل',
      description: 'تعرّفوا على خدمات الاستشارات القانونية التي نقدّمها.',
      empty: 'لا توجد خدمات معروضة حالياً.',
      back: 'العودة إلى الخدمات',
      practiceAreas: 'مجالات الممارسة',
      benefits: 'المزايا',
      overview: 'نظرة عامة',
    },
    blogs: {
      title: 'المدونة',
      description: 'رؤى وتحديثات من عواد الزبون.',
      empty: 'لا توجد مقالات منشورة حالياً.',
      back: 'العودة إلى المدونة',
      allCategories: 'كل التصنيفات',
      by: 'بقلم',
      in: 'في',
      previous: 'السابق',
      next: 'التالي',
    },
    contact: {
      title: 'تواصل معنا',
      description: 'أرسلوا استفساركم إلى فريقنا وسنعاود التواصل معكم في أقرب وقت ممكن.',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      company: 'الشركة',
      country: 'الدولة',
      service: 'الخدمة',
      serviceOptional: 'اختر خدمة (اختياري)',
      message: 'الرسالة',
      submit: 'إرسال الاستفسار',
      sending: 'جارٍ الإرسال…',
      success: 'شكراً لكم. تم استلام استفساركم.',
      error: 'تعذّر إرسال الاستفسار. يرجى المحاولة مرة أخرى.',
      rateLimited: 'تم إرسال عدد كبير من الاستفسارات مؤخراً. يرجى المحاولة لاحقاً.',
      invalid: 'يرجى مراجعة الحقول المظلَّلة والمحاولة مرة أخرى.',
      invalidService: 'يرجى اختيار خدمة صحيحة، أو ترك الحقل فارغاً.',
    },
    about: {
      title: 'من نحن',
      metaDescription:
        'صياغة اليقين القانونية عبر الحدود والمؤسسات. تعرّفوا على المستشار عواد الزبون، المستشار الأول ومؤسس استشارات عواد الزبون القانونية.',
      breadcrumbHome: 'الرئيسية',
      breadcrumbCurrent: 'من نحن',
      heroTitle: 'صياغة اليقين القانونية عبر الحدود والمؤسسات',
      heroTitleParts: [
        { text: 'صياغة اليقين القانونية ', accent: false },
        { text: 'عبر ', accent: false, glueNext: true },
        { text: 'الحدود والمؤسسات', accent: true },
      ],
      heroBody:
        'تأسست على فقه قانوني رصين، وإنفاذ متخصص للملكية الفكرية، وخبرة تجارية دقيقة. نخدم الشركات الرائدة والمبتكرين ومكاتب العائلات السيادية في الأردن ودول مجلس التعاون والاختصاصات الدولية.',
      heroCards: [
        {
          title: 'محكّم مرخّص',
          body: 'هيئات التحكيم التجارية وتسوية المنازعات',
        },
        {
          title: 'وكيل ملكية فكرية معتمد',
          body: 'معتمد لدى الويبو ونظام مدريد',
        },
      ],
      stats: [
        {
          label: 'الخبرة',
          value: '+25',
          description: 'عاماً من القيادة الاستشارية المثبتة',
        },
        {
          label: 'المحفظة',
          value: '+1,200',
          description: 'قضية ومذكرة وإيداع تمت إدارتها',
        },
        {
          label: 'الانتشار',
          value: '+40',
          description: 'اختصاصاً عبر نظام مدريد والويبو',
        },
        {
          label: 'الثقة الائتمانية',
          value: '%98',
          description: 'مؤشر ولاء العملاء المستمرين',
        },
      ],
      founderEyebrow: 'السيرة التنفيذية والولاية القضائية',
      founderHeading: 'ربع قرن من السيادة والدفاع الراسخين',
      founderRole: 'المستشار الأول والمؤسس',
      founderName: 'عواد الزبون',
      founderCredentials: 'محكّم مرخّص • وكيل براءات اختراع وعلامات تجارية معتمد',
      founderPortraitAlt: 'المستشار عواد الزبون، المستشار الأول والمؤسس',
      founderBio1:
        'لأكثر من خمسة وعشرين عاماً، عمل المستشار عواد الزبون مستشاراً قانونياً سرياً ومحامياً أول لدى الشركات عالية النمو، والتكتلات متعددة الجنسيات، والجهات الحكومية، والمشاريع التقنية الرائدة. وتمتد ممارسته بين التقنينات المدنية القارية والمعاملات الأنجلوأمريكية العابرة للحدود المعقّدة.',
      founderBio2:
        'ويُعرف بمرونته الاستراتيجية في تسوية منازعات الملكية الفكرية عالية المخاطر وهياكل العقود بملايين الدولارات، وقد مثّل عملاءه أمام محاكم الاستئناف العليا، والغرف الوزارية، وهيئات التحكيم الخاصة في الأردن وفي المجال الاقتصادي الأوسع لمجلس التعاون.',
      founderQuote:
        'حماية ملكية المؤسسة الفكرية وسيادتها التشغيلية عبر الأسواق العالمية لا تتطلب معرفة بالنصوص القانونية فحسب، بل استشرافاً استراتيجياً ودقّة لا تلين.',
      founderAttribution: 'المستشار عواد الزبون',
      credentialsHeading: 'القبول في نقابات المحامين والاعتمادات الرسمية',
      credentials: [
        {
          title: 'نقابة المحامين الأردنيين',
          body: 'حقوق الترافع القضائي الكاملة',
        },
        {
          title: 'ممثل الويبو',
          body: 'مندوب السجل العالمي للملكية الفكرية',
        },
        {
          title: 'هيئة التحكيم الدولية',
          body: 'محكّم معتمد في تسوية المنازعات',
        },
        {
          title: 'مستشار نظام مدريد',
          body: 'وكيل علامات تجارية متعدد الأطراف',
        },
      ],
      ctaLabel: 'تعاقد سري',
      ctaTitle: 'استعينوا بمستشارينا لخطوتكم الاستراتيجية القادمة',
      ctaTitleLines: [
        [{ text: 'استعينوا بمستشارينا لخطوتكم', accent: false }],
        [{ text: 'الاستراتيجية القادمة', accent: true }],
      ],
      ctaBody:
        'سواء كنتم تحمون تقنيات ملكية مبتكرة، أو تؤسسون فرعاً في الخارج، أو تحكّمون في منازعات شراكة معقّدة، يوفّر فريقنا وضوحاً قانونياً راسخاً.',
      ctaPrimary: 'احجزوا استشارة منظّمة',
      ctaWhatsapp: 'استشارة واتساب مباشرة',
      ctaNote: 'محمي بموجب أحكام سرية العلاقة بين المحامي والموكّل في نقابة المحامين الأردنيين.',
    },
    privacy: {
      title: 'سياسة الخصوصية',
      body: 'نجمع بيانات الاستفسار التي ترسلونها عبر هذا الموقع للرد على طلبكم. الوصول الإداري إلى هذه السجلات مقيَّد. تواصلوا معنا إذا احتجتم إلى مساعدة بخصوص بياناتكم الشخصية الواردة في استفسار.',
    },
    notFound: {
      title: 'الصفحة غير موجودة',
      body: 'الصفحة التي طلبتموها غير متاحة.',
      home: 'العودة إلى الرئيسية',
    },
  },
}

export function getMessages(locale) {
  return messages[normalizeLocale(locale)] || messages.en
}
