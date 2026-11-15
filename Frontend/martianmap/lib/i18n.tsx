"use client";
// Dueño: P4. Idioma de la interfaz (español / inglés).
//
// El texto del código está en español y sirve de llave: t("Pendiente") → "Slope".
// Si una cadena no está en el diccionario se muestra tal cual (en español), así que
// olvidar una traducción nunca rompe la pantalla. Los mensajes con números (avisos de
// ruta) se traducen con PATTERNS. El idioma elegido se guarda en el navegador.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "es" | "en";

const EN: Record<string, string> = {
  // Generales
  "CARGANDO MAPA…": "LOADING MAP…",
  "CARGANDO ZONA…": "LOADING AREA…",
  "NO SE PUDO CARGAR LA ZONA": "COULD NOT LOAD THE AREA",
  "Revisa la conexión o que existan los archivos de": "Check the connection or that these files exist:",
  "Reintentar": "Retry",
  "TERRENO SINTÉTICO · no son datos reales": "SYNTHETIC TERRAIN · not real data",
  "CAPAS": "LAYERS",
  "MODO": "MODE",
  "NOTAS DE CAMPO": "FIELD NOTES",
  "+ NOTA": "+ NOTE",
  "Toca el mapa donde está el hallazgo.": "Tap the map where the finding is.",
  "Cancelar": "Cancel",
  "Cerrar": "Close",
  "Ocultar panel de capas": "Hide layers panel",
  "Mostrar panel de capas": "Show layers panel",
  "Ocultar panel de modo": "Hide mode panel",
  "Mostrar panel de modo": "Show mode panel",
  "Ocultar barra de métricas": "Hide metrics bar",
  "Mostrar barra de métricas": "Show metrics bar",
  "Mapa de la zona": "Map of the area",
  "Cambiar idioma": "Change language",

  // Barra superior y destinos
  "Buscar destino": "Search destination",
  "¿A dónde vamos?": "Where to?",
  "Destinos": "Destinations",
  "OBJETIVO": "TARGET",
  "FOTO": "PHOTO",
  "BASE": "BASE",
  "ENLACE OK": "LINK OK",
  "Modo HUD (visor del casco)": "HUD mode (helmet visor)",
  "Modo HUD": "HUD mode",
  "Supuestos y fuentes": "Assumptions and sources",
  "Base EVA": "EVA Base",
  "Mirador norte": "North overlook",
  "Mirador ladera": "Slope overlook",
  "Punto de partida supuesto por el equipo dentro del DTM. Bradbury Landing (4.59°S 137.44°E) queda unos 14 km al noreste, fuera de este recorte.":
    "Starting point assumed by the team inside the DTM. Bradbury Landing (4.59°S 137.44°E) is about 14 km to the northeast, outside this crop.",
  "Objetivo de muestreo elegido por el equipo sobre la ortofoto": "Sampling target chosen by the team on the orthoimage",
  "Afloramiento en la ladera sur, elegido por el equipo sobre la ortofoto": "Outcrop on the southern slope, chosen by the team on the orthoimage",
  "Punto de observación propuesto por el equipo": "Observation point proposed by the team",

  // Capas
  "Imagen HiRISE": "HiRISE image",
  "Pendiente": "Slope",
  "Radiación": "Radiation",
  "Térmico": "Thermal",
  "Mineralogía": "Mineralogy",
  "MEDIDO": "MEASURED",
  "DERIVADO": "DERIVED",
  "ESTIMADO": "ESTIMATED",
  "SIN DATOS": "NO DATA",
  "MAPA BASE": "BASE MAP",
  "Ninguno": "None",
  "Relieve THEMIS": "THEMIS relief",
  "Color Viking": "Viking color",
  "Fondo oscuro (solo capas de misión)": "Dark background (mission layers only)",
  "Forma del terreno": "Terrain shape",
  "Color natural": "Natural color",
  "LEYENDA": "LEGEND",

  // Modos y recursos
  "Modo de transporte": "Travel mode",
  "A pie": "On foot",
  "Rover abierto": "Open rover",
  "Presurizado": "Pressurized",
  "a pie": "on foot",
  "rover abierto": "by open rover",
  "presurizado": "by pressurized rover",
  "Oxígeno": "Oxygen",
  "Batería": "Battery",
  "Autonomía": "Autonomy",
  "oxígeno": "oxygen",
  "batería": "battery",
  "autonomía": "autonomy",
  "máx": "max",

  // Métricas
  "Toca el mapa o busca un destino.": "Tap the map or search for a destination.",
  "Calculando ruta…": "Computing route…",
  "DISTANCIA": "DISTANCE",
  "IDA": "ONE WAY",
  "RIESGO": "RISK",
  "PENDIENTE MÁX": "MAX SLOPE",
  "DOSIS EST.": "EST. DOSE",
  "OXÍGENO": "OXYGEN",
  "BATERÍA": "BATTERY",
  "AUTONOMÍA": "AUTONOMY",
  "BAJO": "LOW",
  "MEDIO": "MEDIUM",
  "ALTO": "HIGH",
  "Quitar destino": "Clear destination",
  "Ver menos métricas": "Show fewer metrics",
  "Ver más métricas": "Show more metrics",
  "CALCULANDO…": "COMPUTING…",
  "LÍNEA RECTA · sin ruteo todavía: no evita pendientes ni zonas prohibidas":
    "STRAIGHT LINE · not routed yet: it does not avoid slopes or no-go zones",
  "Fuera de la zona cartografiada: elige un punto dentro del mapa.":
    "Outside the mapped area: pick a point inside the map.",

  // Simulación
  "INICIAR RECORRIDO": "START EVA",
  "Simular el recorrido de ida y vuelta": "Simulate the round trip",
  "DETENER": "STOP",
  "REPETIR": "REPLAY",
  "SIMULACIÓN DE EVA": "EVA SIMULATION",
  "SALIENDO DE LA BASE": "LEAVING BASE",
  "IDA AL DESTINO": "HEADING OUT",
  "EN EL DESTINO · MUESTREO": "AT TARGET · SAMPLING",
  "REGRESO A LA BASE": "RETURNING TO BASE",
  "DE VUELTA EN LA BASE": "BACK AT BASE",
  "TIEMPO DE MISIÓN": "MISSION TIME",
  "RECORRIDO": "DISTANCE COVERED",
  "DOSIS": "DOSE",
  "Simulación acelerada: el tiempo de misión corre mucho más rápido que el real.":
    "Accelerated simulation: mission time runs much faster than real time.",

  // HUD
  "TOCA EL MAPA PARA MARCAR DESTINO": "TAP THE MAP TO SET A DESTINATION",
  "SALIR DE HUD": "EXIT HUD",

  // Notas
  "NUEVA NOTA DE CAMPO": "NEW FIELD NOTE",
  "Cancelar nota": "Cancel note",
  "TÍTULO *": "TITLE *",
  "Ej. Veta clara en la cresta": "E.g. Light vein on the ridge",
  "NOTA": "NOTE",
  "Qué viste, dónde exactamente, qué hay que revisar": "What you saw, exactly where, what to check",
  "ETIQUETAS": "TAGS",
  "MUESTRA": "SAMPLE",
  "GEOLOGÍA": "GEOLOGY",
  "REVISAR": "CHECK",
  "PELIGRO": "DANGER",
  "Vista previa de la foto": "Photo preview",
  "Quitar": "Remove",
  "Tomar o elegir foto": "Take or choose a photo",
  "Guardando…": "Saving…",
  "Guardar nota": "Save note",
  "No se pudo guardar la nota.": "Could not save the note.",

  // Supuestos y fuentes
  "SUPUESTOS Y FUENTES": "ASSUMPTIONS AND SOURCES",
  "MODOS DE TRANSPORTE · SUPUESTOS DEL EQUIPO": "TRAVEL MODES · TEAM ASSUMPTIONS",
  "Modo": "Mode",
  "Pend. máx": "Max slope",
  "Velocidad": "Speed",
  "Alcance": "Range",
  "Recurso": "Resource",
  "Blindaje": "Shielding",
  "ninguno": "none",
  "CÓMO SE CALCULA": "HOW IT IS COMPUTED",
  "CAPAS DE DATOS": "DATA LAYERS",
  "FUENTES DE ESTA ZONA": "SOURCES FOR THIS AREA",
  "· sin datos en esta zona": "· no data for this area",
  "Esta zona usa TERRENO SINTÉTICO para pruebas: todavía no son datos reales.":
    "This area uses SYNTHETIC TERRAIN for testing: it is not real data yet.",

  // Mapa
  "DESTINO": "DESTINATION",
  "NO PISAR": "NO-GO",
};

/** Mensajes con números o nombres dentro. */
const PATTERNS: [RegExp, (m: RegExpMatchArray, t: (s: string) => string) => string][] = [
  [/^No hay ruta segura hasta ese punto \((.+)\)\.$/, (m, t) => `No safe route to that point (${t(m[1])}).`],
  [/^No hay ruta segura (.+): prueba otro modo o elige otro destino\.$/,
    (m, t) => `No safe route ${t(m[1])}: try another mode or another destination.`],
  [/^Fuera de alcance: ([\d.]+) km supera los ([\d.]+) km de (.+)\.$/,
    (m, t) => `Out of range: ${m[1]} km exceeds the ${m[2]} km range ${t(m[3])}.`],
  [/^Recurso insuficiente: al volver quedaría (\d+) % de (.+) \(mínimo (\d+) %\)\.$/,
    (m, t) => `Not enough resource: only ${m[1]} % of ${t(m[2])} would be left on return (minimum ${m[3]} %).`],
];

function toEnglish(s: string): string {
  const hit = EN[s];
  if (hit !== undefined) return hit;
  for (const [re, fn] of PATTERNS) {
    const m = s.match(re);
    if (m) return fn(m, toEnglish);
  }
  return s;
}

const STORAGE_KEY = "marswalk-lang";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "es",
  setLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Se lee después de montar para que el HTML del servidor (español) coincida.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada, solo al montar
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {
      /* sin almacenamiento: se queda en español */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* sin almacenamiento: el cambio vale solo en esta visita */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const { lang, setLang } = useContext(LangContext);
  const t = useCallback((s: string) => (lang === "es" ? s : toEnglish(s)), [lang]);
  return { lang, setLang, t };
}
