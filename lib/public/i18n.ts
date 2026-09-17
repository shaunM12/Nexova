export type Locale = "en" | "es";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "nexova-locale";

export type Dictionary = {
  skipToMain: string;
  nav: {
    home: string;
    services: string;
    talent: string;
    contact: string;
    menu: string;
    close: string;
    primary: string;
    homeAria: string;
  };
  language: {
    label: string;
    en: string;
    es: string;
    switchToEn: string;
    switchToEs: string;
  };
  home: {
    heroAlt: string;
    headline: string;
    supporting: string;
    cta: string;
    servicesHeading: string;
    servicesIntro: string;
    headhuntingTitle: string;
    headhuntingItems: [string, string];
    supportTitle: string;
    supportItems: [string, string];
    trainingTitle: string;
    trainingItems: [string, string];
    whyHeading: string;
    whyItems: [string, string, string, string];
    contactHeading: string;
    emailLabel: string;
    valenciaLabel: string;
    miamiLabel: string;
  };
  application: {
    title: string;
    intro: string;
    companyNote: string;
  };
  form: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    experience: string;
    sector: string;
    englishLevel: string;
    availability: string;
    linkedin: string;
    comments: string;
    dataPolicy: string;
    selectCountry: string;
    selectSector: string;
    selectLevel: string;
    countries: Record<"Spain" | "United States" | "Other", string>;
    sectors: Record<
      | "Technology"
      | "Retail"
      | "Financial Services"
      | "Consulting"
      | "Other",
      string
    >;
    levels: Record<"Basic" | "Intermediate" | "Advanced" | "Native", string>;
    availabilityOptions: Record<
      "Immediate" | "1 month" | "2-3 months" | "Just exploring",
      string
    >;
    charactersRemaining: (n: number) => string;
    submit: string;
    clear: string;
    statusCorrectErrors: string;
    statusSubmitted: string;
    statusCleared: string;
    successTitle: string;
    successBody: string;
    successFollowBefore: string;
    successFollowAfter: string;
    backHome: string;
  };
  errors: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    experience: string;
    sector: string;
    englishLevel: string;
    availability: string;
    linkedin: string;
    comments: (remaining: number) => string;
    dataPolicy: string;
  };
  footer: {
    rights: string;
  };
};

const en: Dictionary = {
  skipToMain: "Skip to main content",
  nav: {
    home: "Home",
    services: "Services",
    talent: "Talent",
    contact: "Contact",
    menu: "Menu",
    close: "Close",
    primary: "Primary",
    homeAria: "Nexova home",
  },
  language: {
    label: "Language",
    en: "EN",
    es: "ES",
    switchToEn: "Switch to English",
    switchToEs: "Switch to Spanish",
  },
  home: {
    heroAlt:
      "Four professionals collaborating around a conference table in a bright modern office",
    headline: "We build exceptional teams for growing companies",
    supporting:
      "Human resources consulting and talent acquisition firm with over 10 years helping technology, retail, and financial services companies find and develop the best talent.",
    cta: "Join our talent pool",
    servicesHeading: "Services",
    servicesIntro: "Three ways we help companies find, staff, and develop talent.",
    headhuntingTitle: "Executive Headhunting",
    headhuntingItems: [
      "Search and selection of executive and mid-management profiles",
      "Personalized process with replacement guarantee",
    ],
    supportTitle: "Customer Support Outsourcing",
    supportItems: [
      "Specialized teams for technology companies",
      "Continuous training and dedicated supervision",
    ],
    trainingTitle: "Corporate Training",
    trainingItems: [
      "Soft skills and leadership programs",
      "In-person and online courses adapted to each organization",
    ],
    whyHeading: "Why Nexova",
    whyItems: [
      "12 years of experience in the Latin American market",
      "Regional presence: Spain and United States",
      "+500 successful selection processes completed",
      "Sector specialization in technology, retail, and finance",
    ],
    contactHeading: "Contact",
    emailLabel: "Email",
    valenciaLabel: "Valencia",
    miamiLabel: "Miami",
  },
  application: {
    title: "Talent registration",
    intro:
      "Tell us about your background. Our selection team reviews profiles for current and future opportunities.",
    companyNote: "Are you a company looking for talent? Write to us at",
  },
  form: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    country: "Country of residence",
    experience: "Years of experience",
    sector: "Sector of interest",
    englishLevel: "English level",
    availability: "Availability",
    linkedin: "LinkedIn (profile URL)",
    comments: "Additional comments",
    dataPolicy: "I accept the data policy",
    selectCountry: "Select a country",
    selectSector: "Select a sector",
    selectLevel: "Select your level",
    countries: {
      Spain: "Spain",
      "United States": "United States",
      Other: "Other",
    },
    sectors: {
      Technology: "Technology",
      Retail: "Retail",
      "Financial Services": "Financial Services",
      Consulting: "Consulting",
      Other: "Other",
    },
    levels: {
      Basic: "Basic",
      Intermediate: "Intermediate",
      Advanced: "Advanced",
      Native: "Native",
    },
    availabilityOptions: {
      Immediate: "Immediate",
      "1 month": "1 month",
      "2-3 months": "2-3 months",
      "Just exploring": "Just exploring",
    },
    charactersRemaining: (n) => `${n} characters remaining`,
    submit: "Submit application",
    clear: "Clear form",
    statusCorrectErrors: "Please correct the errors in the form.",
    statusSubmitted: "Application submitted successfully.",
    statusCleared: "Form cleared.",
    successTitle: "Thank you for your interest in Nexova!",
    successBody:
      "We have received your information. Our selection team will review it and contact you if your profile matches any of our current or future opportunities.",
    successFollowBefore: "In the meantime, follow us on",
    successFollowAfter:
      "to stay updated on our vacancies and professional development content.",
    backHome: "Back to home",
  },
  errors: {
    fullName: "Name must contain at least first and last name",
    email: "Enter a valid email (example: name@company.com)",
    phone: "Phone must include country code (example: +34 612 345 678)",
    country: "Select your country of residence",
    experience: "Years of experience must be between 0 and 50",
    sector: "Select your sector of interest",
    englishLevel: "Indicate your English level",
    availability: "Select your availability",
    linkedin: "If you include LinkedIn, it must be a valid URL",
    comments: (remaining) =>
      `Comments cannot exceed 500 characters (${remaining} remaining)`,
    dataPolicy: "You must accept the data processing policy to continue",
  },
  footer: {
    rights: "© 2025 Nexova. All rights reserved.",
  },
};

const es: Dictionary = {
  skipToMain: "Saltar al contenido principal",
  nav: {
    home: "Inicio",
    services: "Servicios",
    talent: "Talento",
    contact: "Contacto",
    menu: "Menú",
    close: "Cerrar",
    primary: "Principal",
    homeAria: "Inicio de Nexova",
  },
  language: {
    label: "Idioma",
    en: "EN",
    es: "ES",
    switchToEn: "Cambiar a inglés",
    switchToEs: "Cambiar a español",
  },
  home: {
    heroAlt:
      "Cuatro profesionales colaborando alrededor de una mesa de reuniones en una oficina moderna y luminosa",
    headline: "Construimos equipos excepcionales para empresas en crecimiento",
    supporting:
      "Firma de consultoría de recursos humanos y adquisición de talento con más de 10 años ayudando a empresas de tecnología, retail y servicios financieros a encontrar y desarrollar el mejor talento.",
    cta: "Únete a nuestra bolsa de talento",
    servicesHeading: "Servicios",
    servicesIntro:
      "Tres formas en las que ayudamos a las empresas a encontrar, dotar y desarrollar talento.",
    headhuntingTitle: "Headhunting ejecutivo",
    headhuntingItems: [
      "Búsqueda y selección de perfiles ejecutivos y de mando intermedio",
      "Proceso personalizado con garantía de reemplazo",
    ],
    supportTitle: "Externalización de atención al cliente",
    supportItems: [
      "Equipos especializados para empresas tecnológicas",
      "Formación continua y supervisión dedicada",
    ],
    trainingTitle: "Formación corporativa",
    trainingItems: [
      "Programas de soft skills y liderazgo",
      "Cursos presenciales y online adaptados a cada organización",
    ],
    whyHeading: "Por qué Nexova",
    whyItems: [
      "12 años de experiencia en el mercado latinoamericano",
      "Presencia regional: España y Estados Unidos",
      "+500 procesos de selección exitosos completados",
      "Especialización sectorial en tecnología, retail y finanzas",
    ],
    contactHeading: "Contacto",
    emailLabel: "Correo",
    valenciaLabel: "Valencia",
    miamiLabel: "Miami",
  },
  application: {
    title: "Registro de talento",
    intro:
      "Cuéntanos sobre tu trayectoria. Nuestro equipo de selección revisa perfiles para oportunidades actuales y futuras.",
    companyNote: "¿Eres una empresa que busca talento? Escríbenos a",
  },
  form: {
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    country: "País de residencia",
    experience: "Años de experiencia",
    sector: "Sector de interés",
    englishLevel: "Nivel de inglés",
    availability: "Disponibilidad",
    linkedin: "LinkedIn (URL del perfil)",
    comments: "Comentarios adicionales",
    dataPolicy: "Acepto la política de datos",
    selectCountry: "Selecciona un país",
    selectSector: "Selecciona un sector",
    selectLevel: "Selecciona tu nivel",
    countries: {
      Spain: "España",
      "United States": "Estados Unidos",
      Other: "Otro",
    },
    sectors: {
      Technology: "Tecnología",
      Retail: "Retail",
      "Financial Services": "Servicios financieros",
      Consulting: "Consultoría",
      Other: "Otro",
    },
    levels: {
      Basic: "Básico",
      Intermediate: "Intermedio",
      Advanced: "Avanzado",
      Native: "Nativo",
    },
    availabilityOptions: {
      Immediate: "Inmediata",
      "1 month": "1 mes",
      "2-3 months": "2-3 meses",
      "Just exploring": "Solo explorando",
    },
    charactersRemaining: (n) => `${n} caracteres restantes`,
    submit: "Enviar solicitud",
    clear: "Limpiar formulario",
    statusCorrectErrors: "Por favor, corrige los errores del formulario.",
    statusSubmitted: "Solicitud enviada correctamente.",
    statusCleared: "Formulario limpiado.",
    successTitle: "¡Gracias por tu interés en Nexova!",
    successBody:
      "Hemos recibido tu información. Nuestro equipo de selección la revisará y te contactará si tu perfil encaja con alguna de nuestras oportunidades actuales o futuras.",
    successFollowBefore: "Mientras tanto, síguenos en",
    successFollowAfter:
      "para estar al día de nuestras vacantes y contenido de desarrollo profesional.",
    backHome: "Volver al inicio",
  },
  errors: {
    fullName: "El nombre debe incluir al menos nombre y apellido",
    email: "Introduce un correo válido (ejemplo: nombre@empresa.com)",
    phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)",
    country: "Selecciona tu país de residencia",
    experience: "Los años de experiencia deben estar entre 0 y 50",
    sector: "Selecciona tu sector de interés",
    englishLevel: "Indica tu nivel de inglés",
    availability: "Selecciona tu disponibilidad",
    linkedin: "Si incluyes LinkedIn, debe ser una URL válida",
    comments: (remaining) =>
      `Los comentarios no pueden superar 500 caracteres (${remaining} restantes)`,
    dataPolicy: "Debes aceptar la política de tratamiento de datos para continuar",
  },
  footer: {
    rights: "© 2025 Nexova. Todos los derechos reservados.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
