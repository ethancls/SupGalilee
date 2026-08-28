import { useState, useEffect } from 'react';
import { Check, X, ChevronRight, Award, BookOpen, Sun, Moon, Lightbulb } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  choices: string[];
  correctIndex: number;
  explication: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// QUESTIONS
const QCM_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Le droit de la sécurité sociale…",
    choices: [
      "régit les relations collectives entre les salariés et les employeurs privés.",
      "rassemble les règles dont l’objectif est de garantir l’individu contre certains risques sociaux.",
      "comprend le droit du travail.",
      "régit les relations entre les fonctionnaires et l’administration qui les emploie."
    ],
    correctIndex: 1,
    explication: "Il rassemble les règles destinées à protéger l'individu contre les risques sociaux (maladie, vieillesse, chômage)."
  },
  {
    id: 2,
    question: "Les traités internationaux…",
    choices: [
      "sont conclus entre les organisations syndicales de salariés et d’employeurs représentatives dans leur champ d’application.",
      "ne peuvent être conclus qu’entre deux États.",
      "sont, le plus souvent, négociés au sein de l’Organisation Internationale du Travail lorsqu’ils concernent le droit du travail.",
      "ne peuvent porter que sur le droit du travail."
    ],
    correctIndex: 2,
    explication: "Dans le domaine social, les conventions multilatérales sont majoritairement négociées à l'OIT avant d'être ouvertes à la ratification des États."
  },
  {
    id: 3,
    question: "L’Organisation Internationale du travail est…",
    choices: [
      "une agence spécialisée du Conseil de l’Europe.",
      "une agence spécialisée de l’ONU sur les questions de droit social.",
      "une agence spécialisée de l’ONU sur les questions culturelles.",
      "une agence spécialisée de l’Union Européenne."
    ],
    correctIndex: 1,
    explication: "L'OIT est, depuis 1946, l'agence spécialisée de l'ONU chargée des normes internationales du travail."
  },
  {
    id: 4,
    question: "La Charte sociale européenne…",
    choices: [
      "peut être invoquée devant la Cour Européenne des Droits de l’Homme dont le rôle est de veiller à son application par les États signataires.",
      "a été rédigée par l’Union Européenne.",
      "ne s’impose pas au juge français selon la Cour de cassation (absence d’effet direct).",
      "n’a pas été ratifiée par la France."
    ],
    correctIndex: 2,
    explication: "La Cour de cassation considère que la Charte sociale européenne n'a pas d'effet direct et ne peut donc être invoquée directement devant les juridictions françaises."
  },
  {
    id: 5,
    question: "Les règlements communautaires…",
    choices: [
      "ne s’imposent pas au juge national (pas d’effet direct).",
      "ne sont pas contraignants pour les États membres.",
      "ne peuvent pas concerner la réglementation du travail.",
      "s’imposent immédiatement aux États membres."
    ],
    correctIndex: 3,
    explication: "En droit de l'Union, le règlement est d'application directe et obligatoire dans tous ses éléments dès sa publication."
  },
  {
    id: 6,
    question: "Lequel de ces actes susceptibles d’être pris par les institutions de l’Union Européenne n’est pas contraignant ?",
    choices: [
      "la décision",
      "la recommandation",
      "le règlement",
      "la directive"
    ],
    correctIndex: 1,
    explication: "Les recommandations expriment seulement une invitation à agir et n'ont aucune force obligatoire pour les États membres."
  },
  {
    id: 7,
    question: "La Cour de Justice de l’Union Européenne…",
    choices: [
      "peut être interrogée par une juridiction nationale sur l’application du droit communautaire.",
      "veille au respect de la Convention Européenne de Sauvegarde des Droits de l’Homme.",
      "ne peut pas être saisie que par un État membre (jamais par un particulier ou une entreprise).",
      "est la seule institution juridictionnelle de l’Union Européenne."
    ],
    correctIndex: 0,
    explication: "Le mécanisme de la question préjudicielle permet à toute juridiction nationale de demander à la CJUE d'interpréter le droit de l'Union."
  },
  {
    id: 8,
    question: "Lequel de ces textes ne fait pas partie du « bloc de constitutionnalité » ?",
    choices: [
      "Les lois constitutionnelles de 1785.",
      "La Constitution du 4 octobre 1958.",
      "La Charte de l’environnement de 2004.",
      "Le préambule de la Constitution de 1946."
    ],
    correctIndex: 0,
    explication: "Il n'existe pas de lois constitutionnelles de 1785 ; c'est donc le seul texte cité qui ne figure pas dans le bloc de constitutionnalité."
  },
  {
    id: 9,
    question: "Laquelle de ces propositions est exacte ?",
    choices: [
      "Les sujets relevant de la loi sont limitativement énumérés par la Constitution.",
      "Le recours à l’article 49-3 de la Constitution permet au gouvernement la promulgation de loi sans vote du Parlement.",
      "Le Conseil constitutionnel n’a qu’un rôle consultatif.",
      "Les ordonnances permettent au gouvernement d’adopter des textes relevant du domaine législatif avec l’accord du Parlement."
    ],
    correctIndex: 3,
    explication: "L'article 38 de la Constitution autorise le gouvernement, après habilitation par le Parlement, à légiférer par ordonnances dans le domaine de la loi."
  },
  {
    id: 10,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "Les décrets d’application permettent d’apporter les précisions nécessaires à la mise en œuvre des lois.",
      "Les textes d’origine réglementaire ont une valeur supérieure aux lois.",
      "Le numéro des articles du code du travail d’origine réglementaire est précédé de la lettre R ou D.",
      "Les décrets autonomes traitent des sujets ne relevant pas du domaine législatif."
    ],
    correctIndex: 1,
    explication: "Le pouvoir réglementaire est placé sous la loi ; il ne lui est donc jamais supérieur."
  },
  {
    id: 11,
    question: "Selon la pyramide de KELSEN (de la plus importante à la moins importante) :",
    choices: [
      "Bloc de constitutionnalité / Bloc de légalité / Bloc de conventionnalité / Bloc réglementaire",
      "Bloc de conventionnalité / Bloc de constitutionnalité / Bloc de légalité / Bloc réglementaire",
      "Bloc réglementaire / Bloc de légalité / Bloc de conventionnalité / Bloc de constitutionnalité",
      "Bloc de constitutionnalité / Bloc de conventionnalité / Bloc de légalité / Bloc réglementaire"
    ],
    correctIndex: 3,
    explication: "La hiérarchie des normes place d'abord la Constitution, puis les traités internationaux, ensuite la loi, et enfin les règlements."
  },
  {
    id: 12,
    question: "Lequel de ces critères n’est pas pris en compte pour apprécier la représentativité des organisations syndicales de salariés et des organisations professionnelles d’employeurs ?",
    choices: [
      "Justifier d’une implantation sur tout le territoire national",
      "Disposer d’une audience suffisante parmi ceux qu’elles entendent représenter",
      "Être financièrement transparente",
      "Respect des valeurs républicaines"
    ],
    correctIndex: 0,
    explication: "La loi ne fait pas de l'implantation sur tout le territoire un critère de représentativité ; l'audience, la transparence financière et le respect des valeurs républicaines sont en revanche exigés."
  },
  {
    id: 13,
    question: "Pour être applicable, un accord ou une convention de branche…",
    choices: [
      "doit être étendu par un arrêté préfectoral.",
      "doit être signé par une ou plusieurs organisations syndicales de salariés représentant au moins 50 %.",
      "ne doit pas avoir fait l’objet d’une opposition par une ou plusieurs organisations syndicales représentant au moins 50 %.",
      "doit être signé par une ou plusieurs organisations patronales dont les adhérents occupent au moins 50 % des effectifs."
    ],
    correctIndex: 2,
    explication: "Depuis la loi de 2016, l'accord est valable sauf opposition de syndicats majoritaires (≥ 50 % des voix) dans un délai déterminé."
  },
  {
    id: 14,
    question: "Laquelle de ces organisations patronales n’a pas été considérée comme représentative au niveau national et interprofessionnel par l’arrêté du 18 novembre 2021 ?",
    choices: [
      "La Confédération des Petites et Moyennes Entreprises (CPME)",
      "L’Union des Entreprises de Proximité (U2P)",
      "Le Mouvement des Entreprises de France (MEDEF)",
      "L’Union des Employeurs de l’Économie Sociale et Solidaire (UDES)"
    ],
    correctIndex: 3,
    explication: "L'arrêté du 18 novembre 2021 a reconnu le MEDEF, la CPME et l'U2P comme organisations représentatives, pas l'UDES."
  },
  {
    id: 15,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "Un employeur peut librement décider d’appliquer une convention de branche signée par une organisation patronale dont il n’est pas adhérent.",
      "Il suffit à une entreprise adhérente à une organisation patronale signataire de la quitter (désadhérer) pour ne plus être tenue d’appliquer la convention de branche signée par cette dernière.",
      "Une convention de branche non étendue ne s’applique qu’aux entreprises adhérentes aux organisations patronales signataires.",
      "Seuls les salariés adhérents à l’une des organisations syndicales signataires peuvent bénéficier des dispositions d’une convention de branche non étendue."
    ],
    correctIndex: 1,
    explication: "La désaffiliation ne libère pas rétroactivement l'entreprise des conventions signées avant son départ ; elle reste tenue d'appliquer les textes conclus auparavant."
  },
  {
    id: 16,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "La procédure d’élargissement permet de rendre une convention collective de branche obligatoire pour les entreprises relevant d’un autre secteur d’activité que celui initialement couvert.",
      "La procédure d’extension permet de rendre une convention collective de branche obligatoire à toutes les entreprises du secteur concerné, qu’elles soient ou non adhérentes à l’une des organisations patronales signataires.",
      "Très peu de conventions collectives de branche font l’objet d’un arrêté d’extension.",
      "Les organisations patronales non-signataires peuvent, sous certaines conditions, s’opposer à l’entrée en vigueur d’une convention de branche."
    ],
    correctIndex: 2,
    explication: "En réalité, la majorité des conventions de branche sont étendues ; il est donc inexact de dire qu'elles sont 'très peu' à l'être."
  },
  {
    id: 17,
    question: "Dans les entreprises disposant de délégués syndicaux…",
    choices: [
      "Un accord d’entreprise est applicable dès lors qu’il est signé par des délégués syndicaux représentant 8 % du personnel.",
      "Un accord d’entreprise est applicable dès lors qu’il est signé par un ou plusieurs délégués syndicaux représentant au moins 50 % des suffrages exprimés en faveur d’organisations représentatives au premier tour des dernières élections professionnelles.",
      "Un accord d’entreprise peut être négocié avec des membres élus du CSE.",
      "Un accord d’entreprise est applicable dès lors qu’il est signé par au moins trois délégués syndicaux indépendamment de leur représentativité dans l’entreprise."
    ],
    correctIndex: 1,
    explication: "Le seuil majoritaire de 50 % des suffrages exprimés au premier tour des élections professionnelles conditionne la validité des accords d'entreprise."
  },
  {
    id: 18,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "Le principe de faveur permet aux partenaires sociaux de déroger à des normes relevant de l’ordre public absolu.",
      "Les dispositions « supplétives » du code du travail s’imposent uniquement en l’absence de normes définies par accord collectif.",
      "Le principe de faveur est une exception au principe de hiérarchie des normes spécifique au droit du travail.",
      "Le principe de faveur permet, dans certaines conditions, de faire prévaloir la norme issue d’un accord collectif sur celle issue du code du travail dès lors qu’elle est plus favorable pour les salariés."
    ],
    correctIndex: 0,
    explication: "Le principe de faveur ne permet jamais de déroger aux règles d'ordre public absolu, lesquelles sont impératives et intangibles."
  },
  {
    id: 19,
    question: "Laquelle de ces normes n’est pas d’origine jurisprudentielle ?",
    choices: [
      "l’accord atypique",
      "le règlement intérieur",
      "l’usage d’entreprise",
      "l’engagement unilatéral"
    ],
    correctIndex: 1,
    explication: "Le règlement intérieur est directement encadré par le Code du travail, alors que les trois autres notions résultent initialement de la jurisprudence."
  },
  {
    id: 20,
    question: "Laquelle de ces caractéristiques ne permet pas d’identifier un usage d’entreprise ?",
    choices: [
      "La fixité de l’avantage accordé aux salariés",
      "La constance de l’avantage accordé aux salariés",
      "La généralité de l’avantage accordé aux salariés",
      "La conclusion d’un accord collectif reconnaissant l’avantage accordé aux salariés"
    ],
    correctIndex: 3,
    explication: "Un usage se définit par la constance, la généralité et la fixité de l'avantage ; la conclusion d'un accord collectif n'entre pas dans ces critères."
  },
  {
    id: 21,
    question: "Laquelle de ces caractéristiques est propre au contrat de travail et permet de le distinguer du contrat d’entreprise ?",
    choices: [
      "l’existence d’un lien de subordination juridique",
      "la réalisation d’une prestation",
      "la dépendance économique entre les cocontractants",
      "le versement d’une contrepartie financière"
    ],
    correctIndex: 0,
    explication: "Seul le contrat de travail implique un lien de subordination juridique qui se matérialise par les pouvoirs de direction, contrôle et sanction."
  },
  {
    id: 22,
    question: "Lequel de ces éléments n’entre pas dans la définition du lien de subordination juridique ?",
    choices: [
      "Le pouvoir de sanctionner",
      "Le pouvoir de contrôler",
      "Le pouvoir de commander",
      "L’intégration à un service organisé"
    ],
    correctIndex: 3,
    explication: "La définition classique repose sur les trois pouvoirs : commander, contrôler et sanctionner ; l'intégration à un service organisé n'est qu'un indice facultatif."
  },
  {
    id: 23,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "Le fait qu’un chauffeur puisse être déconnecté provisoirement ou définitivement de l’application en cas de refus de course ou de signalements négatifs de clients caractérise, pour la Cour de cassation, le pouvoir de sanction dont dispose la plateforme qui propose l’application.",
      "Selon la jurisprudence actuelle, le seul fait de mettre en relation un client avec un chauffeur (VTC) suffit à qualifier de contrat de travail la relation qui lie ce chauffeur à la plateforme numérique qui assure cette mise en relation.",
      "Le fait qu’une application de mise en relation permette à la plateforme qui la propose de géolocaliser le chauffeur qui l’utilise démontre, pour la Cour de cassation, l’existence d’un contrôle de la plateforme sur la prestation réalisée par le chauffeur.",
      "Le juge n’est pas lié par la qualification donnée par les parties à leur relation."
    ],
    correctIndex: 1,
    explication: "La Cour de cassation exige qu'un lien de subordination soit démontré ; la simple mise en relation par plateforme ne suffit pas en soi à qualifier un contrat de travail."
  },
  {
    id: 24,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "La rédaction d’un contrat de travail signé par les parties est obligatoire même en cas de recrutement sur un emploi à temps plein exercé pour une durée indéterminée (CDI temps plein).",
      "Les clauses du contrat de travail peuvent restreindre l’exercice par le salarié de ses libertés individuelles ou collectives à la double condition que ces restrictions soient justifiées par la nature de la tâche à accomplir et proportionnées au but recherché.",
      "Les clauses du contrat de travail ne peuvent pas être moins favorables au salarié que le code du travail ou les accords collectifs applicables sauf si des dérogations en ce sens sont prévues par le code du travail ou lesdits accords.",
      "Le code du travail interdit l’insertion de certaines clauses dans les contrats de travail (clause de responsabilité financière, clause d’indexation du salaire sur le SMIC, etc.)."
    ],
    correctIndex: 0,
    explication: "En droit français, le CDI à temps plein peut être conclu verbalement ; l’écrit n’est exigé que pour certaines mentions particulières (temps partiel, clauses spécifiques, etc.). La proposition affirmant son caractère obligatoire est donc inexacte."
  },
  {
    id: 25,
    question: "Laquelle de ces propositions est exacte ?",
    choices: [
      "Le salarié peut, en principe, imposer à son employeur un changement de ses conditions de travail.",
      "L’employeur peut, en principe, imposer à son salarié un changement de ses conditions de travail.",
      "Le salarié peut, en principe, imposer à son employeur la modification d’un élément de son contrat de travail.",
      "L’employeur peut, en principe, imposer à son salarié la modification d’un élément de son contrat de travail."
    ],
    correctIndex: 1,
    explication: "Relèvent du pouvoir de direction de l’employeur les modifications des conditions de travail (lieu, horaires, méthodes) dès lors qu’elles n’affectent pas un élément essentiel du contrat."
  },
  {
    id: 26,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "L’employeur peut unilatéralement imposer un changement de ses conditions de travail à un salarié sauf si cette mesure entraîne le bouleversement de l’économie même du contrat.",
      "L’employeur peut unilatéralement imposer un changement de ses conditions de travail à un salarié sauf si sa décision est discriminatoire ou caractérise un abus de droit.",
      "L’employeur peut unilatéralement imposer un changement de ses conditions de travail à un salarié sauf si cette mesure entraîne incidemment la modification d’un élément de son contrat de travail.",
      "L’employeur peut unilatéralement imposer un changement de ses conditions de travail à un salarié sans que celui-ci ne puisse jamais s’y opposer."
    ],
    correctIndex: 3,
    explication: "Le salarié peut refuser la modification de son contrat ou une mesure abusive ; l’idée qu’il ne pourrait ‘jamais’ s’y opposer est donc erronée."
  },
  {
    id: 27,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "Le transfert légal des contrats de travail prévu en cas de cession d’entreprise concerne tous les salariés en activité au moment de la cession, quel que soit leur contrat de travail.",
      "Le transfert légal des contrats de travail s’impose au repreneur mais aussi aux salariés transférés qui, s’ils refusent de travailler pour leur nouvel employeur, peuvent être sanctionnés voire licenciés pour motif disciplinaire.",
      "En cas de ‘transfert d’une entité économique conservant son identité et dont l’activité est poursuivie ou reprise’, le code du travail prévoit que les contrats de travail des salariés se poursuivent auprès du repreneur.",
      "Le transfert conventionnel prévu par certaines conventions collectives en cas de perte de marché (nettoyage, sécurité, etc.) s’impose au repreneur mais aussi aux salariés qui, s’ils refusent de travailler pour leur nouvel employeur, peuvent être sanctionnés voire licenciés pour motif disciplinaire."
    ],
    correctIndex: 3,
    explication: "En cas de transfert conventionnel, le salarié peut refuser la poursuite de son contrat ; il ne s’expose pas à une sanction disciplinaire pour ce motif. L’affirmation est donc inexacte."
  },
  {
    id: 28,
    question: "Laquelle de ces mesures ne constitue pas une sanction disciplinaire ?",
    choices: [
      "la mise à pied conservatoire",
      "l’avertissement écrit",
      "la rétrogradation",
      "la mise à pied disciplinaire"
    ],
    correctIndex: 0,
    explication: "La mise à pied conservatoire est une mesure provisoire visant à écarter le salarié dans l’attente d’une sanction éventuelle ; elle n’est pas, en elle‑même, une sanction disciplinaire."
  },
  {
    id: 29,
    question: "Laquelle de ces propositions, concernant la convocation à l’entretien préalable en matière disciplinaire (hors licenciement), est inexacte ?",
    choices: [
      "La convocation doit préciser au salarié sa faculté d’y être assisté par un membre du personnel.",
      "La convocation doit lui être adressée dans un délai ‘suffisant’.",
      "La convocation doit préciser les faits reprochés au salarié.",
      "La convocation doit préciser l’objet de l’entretien."
    ],
    correctIndex: 2,
    explication: "Pour les sanctions autres que le licenciement, la lettre de convocation n’a pas à détailler les faits reprochés ; cette obligation vaut uniquement en matière de licenciement disciplinaire."
  },
  {
    id: 30,
    question: "Laquelle de ces propositions est inexacte ?",
    choices: [
      "La démission doit être acceptée par l’employeur.",
      "Le salarié n’a pas à justifier d’un motif légitime pour démissionner.",
      "L’employeur peut désormais considérer un salarié absent comme démissionnaire si celui-ci ne répond pas, dans les quinze jours, à une mise en demeure de reprendre le travail ou de justifier de son absence.",
      "La démission doit résulter d’une volonté claire et non équivoque."
    ],
    correctIndex: 0,
    explication: "La démission est un acte unilatéral du salarié ; elle n’a pas à être acceptée par l’employeur, lequel ne peut que l’enregistrer."
  }
];

const QCM_QUESTIONS_2024: Question[] = [
  {
    "id": 1,
    "question": "Le « bloc de constitutionnalité » comprend…",
    "choices": [
      "le préambule de la Constitution de 1946",
      "les décrets pris après avis du Conseil d’État",
      "les arrêtés ministériels",
      "les traités internationaux ratifiés par la France"
    ],
    "correctIndex": 0,
    "explication": "Le préambule de 1946 fait partie des textes à valeur constitutionnelle reconnus par le Conseil constitutionnel ; les autres actes ont un rang inférieur."
  },
  {
    "id": 2,
    "question": "La Convention européenne de sauvegarde des droits de l’Homme…",
    "choices": [
      "est issue du Conseil de l’Europe",
      "a été adoptée à l’OIT",
      "a été adoptée par l’Assemblée nationale",
      "est issue de l’Union européenne"
    ],
    "correctIndex": 0,
    "explication": "Signée à Rome en 1950 sous l’égide du Conseil de l’Europe, organisation distincte de l’UE."
  },
  {
    "id": 3,
    "question": "Le test professionnel…",
    "choices": [
      "est obligatoirement rémunéré",
      "est identique à la période d’essai",
      "est réalisé avant la conclusion du contrat de travail",
      "peut durer jusqu’à un mois"
    ],
    "correctIndex": 2,
    "explication": "C’est une mise en situation qui se déroule avant toute embauche ; il n’y a donc pas encore de contrat."
  },
  {
    "id": 4,
    "question": "Le conseil de prud’hommes…",
    "choices": [
      "rend des jugements insusceptibles d’appel",
      "est composé de magistrats professionnels",
      "tranche les litiges entre commerçants",
      "est composé de représentants des salariés et des employeurs"
    ],
    "correctIndex": 3,
    "explication": "Juridiction paritaire : conseillers prud’homaux élus parmi salariés et employeurs, non des magistrats professionnels."
  },
  {
    "id": 5,
    "question": "Les arrêtés…",
    "choices": [
      "sont des décisions de justice",
      "permettent de stopper l’examen d’un projet de loi",
      "sont des actes réglementaires votés par le Parlement",
      "sont des actes réglementaires pris par une autorité administrative"
    ],
    "correctIndex": 3,
    "explication": "Un arrêté est adopté par une autorité administrative (ministre, préfet, maire, etc.), jamais par le Parlement."
  },
  {
    "id": 6,
    "question": "Quel type de contrat de travail n’est pas obligatoirement écrit ?",
    "choices": [
      "Le contrat à temps partiel",
      "Le contrat d’apprentissage",
      "Le contrat à durée déterminée",
      "Le contrat à durée indéterminée à temps plein"
    ],
    "correctIndex": 3,
    "explication": "Seul le CDI temps plein peut être conclu verbalement ; les trois autres nécessitent un écrit (art. L.1242-12, L.3123-14, L.6222-3)."
  },
  {
    "id": 7,
    "question": "Un accord de branche étendu…",
    "choices": [
      "s’applique à toutes les entreprises du secteur d’activité concerné par l’accord",
      "n’implique pas un arrêté d’extension du ministère du Travail",
      "s’applique aux seules entreprises adhérentes des organisations patronales signataires",
      "s’applique à toutes les entreprises situées en France, quel que soit leur secteur d’activité"
    ],
    "correctIndex": 0,
    "explication": "L’arrêté d’extension rend l’accord obligatoire pour toutes les entreprises relevant du champ professionnel visé, qu’elles soient adhérentes ou non."
  },
  {
    "id": 8,
    "question": "Les directives communautaires…",
    "choices": [
      "ne fixent jamais de normes relatives au droit du travail",
      "sont immédiatement applicables dans les États membres",
      "doivent être transposées dans un délai déterminé dans la réglementation des États membres",
      "ont la valeur d’un avis non contraignant"
    ],
    "correctIndex": 2,
    "explication": "Une directive lie les États quant au résultat à atteindre ; elle doit être transposée dans le droit interne avant la date limite."
  },
  {
    "id": 9,
    "question": "Quel élément ne permet pas de caractériser le lien de subordination juridique ?",
    "choices": [
      "L’intégration du salarié à un service organisé",
      "Le pouvoir de sanctionner le non-respect des directives",
      "Le pouvoir de donner des directives",
      "Le pouvoir de contrôler le respect des directives"
    ],
    "correctIndex": 0,
    "explication": "La définition classique (arrêt « Société Générale », 1996) repose sur les pouvoirs de direction, contrôle et sanction ; l’intégration n’est qu’un indice supplémentaire."
  },
  {
    "id": 10,
    "question": "Le recours au télétravail…",
    "choices": [
      "peut être imposé au salarié en cas de circonstances exceptionnelles",
      "peut être imposé par l’employeur en toute circonstance",
      "peut être unilatéralement imposé par le salarié",
      "peut être refusé par le salarié en toute circonstance"
    ],
    "correctIndex": 0,
    "explication": "Art. L.1222-11 : l’employeur peut imposer temporairement le télétravail pour garantir la continuité de l’activité et la protection des salariés (ex. pandémie)."
  },
  {
    "id": 11,
    "question": "Peut justifier une sanction disciplinaire…",
    "choices": [
      "l’exercice d’un droit reconnu au salarié (droit syndical, droit de grève)",
      "un motif discriminatoire lié aux origines du salarié, à son orientation sexuelle ou à sa religion",
      "une insuffisance professionnelle ou une insuffisance de résultat",
      "une exécution volontairement défectueuse du travail"
    ],
    "correctIndex": 3,
    "explication": "Seule une faute volontaire engage la responsabilité disciplinaire ; exercer un droit ou être en insuffisance professionnelle ne constitue pas une faute."
  },
  {
    "id": 12,
    "question": "Laquelle de ces propositions est exacte ?",
    "choices": [
      "Le salarié ne peut pas être sanctionné pour avoir refusé un changement de ses conditions de travail",
      "Le salarié peut imposer à l’employeur un changement de ses conditions de travail",
      "Le salarié ne peut pas être sanctionné pour avoir refusé une modification de son contrat de travail",
      "L’employeur peut imposer au salarié la modification de son contrat de travail"
    ],
    "correctIndex": 2,
    "explication": "La modification d’un élément du contrat nécessite l’accord du salarié ; refuser cette modification ne saurait être sanctionné."
  },
  {
    "id": 13,
    "question": "La période d’essai…",
    "choices": [
      "n’est possible que pour les cadres et ingénieurs",
      "n’est pas rémunérée",
      "doit être prévue dans le contrat de travail",
      "est systématique"
    ],
    "correctIndex": 2,
    "explication": "Pour être valable, l’essai doit être stipulé dans une clause expresse (art. L.1221-23)."
  },
  {
    "id": 14,
    "question": "Laquelle de ces sources du droit du travail n’est pas d’origine « jurisprudentielle » ?",
    "choices": [
      "Le contrat de travail",
      "L’engagement unilatéral",
      "L’accord atypique",
      "L’usage"
    ],
    "correctIndex": 0,
    "explication": "Le contrat de travail est encadré par le Code du travail ; les trois autres notions ont été construites par la jurisprudence."
  },
  {
    "id": 15,
    "question": "Les ordonnances…",
    "choices": [
      "ne peuvent pas être utilisées par le Gouvernement en matière de droit du travail",
      "sont utilisées par le Gouvernement pour prescrire des médicaments",
      "permettent au Parlement de légiférer sur des sujets ne relevant pas de la loi",
      "permettent au Gouvernement d’adopter directement des normes relevant du pouvoir législatif avec l’autorisation du Parlement"
    ],
    "correctIndex": 3,
    "explication": "Article 38 de la Constitution : après habilitation législative, le Gouvernement peut édicter des mesures de nature législative par ordonnances."
  },
  {
    "id": 16,
    "question": "Dans les entreprises de plus de 50 salariés…",
    "choices": [
      "l’employeur doit mentionner dans le règlement intérieur la nature et l’échelle des sanctions susceptibles d’être prononcées",
      "l’absence de règlement intérieur n’empêche pas l’employeur de notifier une mise à pied disciplinaire",
      "l’absence de règlement intérieur empêche tout licenciement disciplinaire",
      "l’employeur peut prendre des sanctions non prévues par le règlement intérieur"
    ],
    "correctIndex": 0,
    "explication": "Art. L.1321-1 : le règlement doit préciser la nature et l’échelle des sanctions ; à défaut, l’employeur ne peut pas légalement prononcer de sanction autre qu’un avertissement."
  },
  {
    "id": 17,
    "question": "Le droit international public s’intéresse…",
    "choices": [
      "aux règles définissant les relations entre un État et ses administrations",
      "aux règles applicables entre personnes privées",
      "aux règles gouvernant les relations entre États (traités)",
      "aux règles définissant les infractions et leurs sanctions"
    ],
    "correctIndex": 2,
    "explication": "Il régit la formation, l’interprétation et l’exécution des traités ainsi que les relations inter-étatiques."
  },
  {
    "id": 18,
    "question": "Les « délits » sont jugés par…",
    "choices": [
      "les tribunaux de police",
      "les cours d’assises",
      "les cours criminelles départementales",
      "les tribunaux correctionnels"
    ],
    "correctIndex": 3,
    "explication": "En droit pénal français : contraventions → tribunal de police, délits → tribunal correctionnel, crimes → cour d’assises/cour criminelle."
  },
  {
    "id": 19,
    "question": "L’assemblée générale de l’OIT est composée…",
    "choices": [
      "de délégations tripartites constituées de représentants des États membres, des syndicats de salariés et des organisations patronales",
      "de représentants des États membres",
      "de représentants des syndicats de salariés",
      "de représentants des organisations patronales"
    ],
    "correctIndex": 0,
    "explication": "L’OIT fonctionne sur le principe du tripartisme ; chaque délégation nationale compte 2 délégués gouvernementaux, 1 employeur, 1 travailleur."
  },
  {
    "id": 20,
    "question": "Une règle de droit…",
    "choices": [
      "ne peut pas être modifiée",
      "doit être renouvelée tous les cent ans pour continuer à s’appliquer",
      "ne peut pas être abrogée",
      "reste applicable tant qu’elle n’est pas abrogée ou modifiée"
    ],
    "correctIndex": 3,
    "explication": "Le principe de sécurité juridique veut qu’une norme reste en vigueur jusqu’à son abrogation explicite ou implicite."
  },
  {
    "id": 21,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "La règle de droit est permanente.",
      "La règle de droit est obligatoire.",
      "La règle de droit est inutile.",
      "La règle de droit est générale."
    ],
    "correctIndex": 2,
    "explication": "La règle de droit poursuit un objectif d’organisation et de pacification sociales ; elle n’est donc jamais « inutile ». Les trois autres attributs (permanente, obligatoire, générale) sont classiquement admis."
  },
  {
    "id": 22,
    "question": "Constitue une restriction légitime aux libertés individuelles",
    "choices": [
      "le contrôle d’alcoolémie imposé au salarié conduisant son chariot automoteur dans l’entreprise.",
      "l’obligation du port d’une tenue spécifique pour le salarié en contact avec le public.",
      "la clause de non-concurrence prévue au contrat de travail d’un commercial.",
      "l’interdiction faite au salarié d’un garage automobile de conduire un véhicule d’une marque concurrente."
    ],
    "correctIndex": 1,
    "explication": "L’exigence de tenue relève d’un motif objectif (image, hygiène, sécurité) et proportionné ; elle est donc licite. Les autres mesures seraient excessives ou sans lien direct avec la tâche."
  },
  {
    "id": 23,
    "question": "Selon la hiérarchie des normes applicables en France",
    "choices": [
      "la loi a une valeur supérieure aux traités internationaux ratifiés.",
      "la loi a une valeur supérieure à la Constitution.",
      "la loi a une valeur supérieure aux directives communautaires.",
      "la loi a une valeur supérieure aux décrets."
    ],
    "correctIndex": 3,
    "explication": "Dans l’ordre interne, les règlements (décrets, arrêtés) sont inférieurs à la loi ; inversement, traités et Constitution priment sur la loi."
  },
  {
    "id": 24,
    "question": "Un accord d’entreprise",
    "choices": [
      "peut être unilatéralement imposé par l’employeur.",
      "peut être conclu avec le délégué d’un syndicat ayant recueilli moins de 10 % des voix aux dernières élections du CSE.",
      "peut uniquement être conclu dans les entreprises adhérentes à une organisation patronale.",
      "peut être conclu malgré l’absence de délégué syndical dans l’entreprise."
    ],
    "correctIndex": 3,
    "explication": "Depuis les ordonnances 2017, les petites entreprises sans délégué syndical peuvent négocier via référendum, élus CSE ou salariés mandatés selon l’effectif."
  },
  {
    "id": 25,
    "question": "Laquelle de ces affirmations est inexacte ?",
    "choices": [
      "Un accord collectif peut déroger aux dispositions supplétives du Code du travail.",
      "Un accord d’entreprise peut déroger à un accord de branche dans un sens moins favorable pour le salarié.",
      "Certains sujets définis par la loi (bloc 1) ne peuvent être négociés qu’au niveau de la branche.",
      "Un accord collectif peut déroger à la loi dans un sens plus favorable (hors ordre public absolu)."
    ],
    "correctIndex": 1,
    "explication": "Sauf dispositions légales contraires (matières « verrouillées »), un accord de branche prime sur un accord d’entreprise si ce dernier est moins favorable."
  },
  {
    "id": 26,
    "question": "Pour être applicable, un accord de branche…",
    "choices": [
      "doit obligatoirement être plus favorable que la loi.",
      "doit être validé par le ministère du Travail.",
      "doit être conclu par des organisations syndicales représentant au moins 30 % des salariés du secteur concerné.",
      "doit obligatoirement être conclu par plusieurs organisations patronales représentatives."
    ],
    "correctIndex": 2,
    "explication": "Le critère décisif est la signature, côté salariés, d’OS représentatives totalisant ≥ 30 % des suffrages, sauf opposition majoritaire."
  },
  {
    "id": 27,
    "question": "Le Conseil constitutionnel",
    "choices": [
      "rend uniquement des avis sur la conformité des lois à la Constitution.",
      "est composé de 20 membres élus.",
      "peut se prononcer sur la constitutionnalité d’une loi contestée par un justiciable (QPC).",
      "ne peut être saisi que par le Président de la République."
    ],
    "correctIndex": 2,
    "explication": "Depuis 2010, la question prioritaire de constitutionnalité (QPC) permet à tout justiciable, via les juridictions ordinaires, de le saisir."
  },
  {
    "id": 28,
    "question": "Ne constitue pas un droit ou une liberté fondamentale",
    "choices": [
      "Le respect de la vie personnelle.",
      "Le droit de discuter pendant les cours.",
      "Le droit d’agir en justice.",
      "L’exercice du droit syndical."
    ],
    "correctIndex": 1,
    "explication": "Le droit de bavarder n’est pas protégé au rang de liberté fondamentale, contrairement aux trois autres prérogatives reconnues."
  },
  {
    "id": 29,
    "question": "Laquelle de ces conditions n’est pas nécessaire pour caractériser l’usage ?",
    "choices": [
      "La fixité.",
      "La contractualisation.",
      "La constance.",
      "La généralité."
    ],
    "correctIndex": 1,
    "explication": "Un usage est né d’une pratique fixée, constante et générale ; il n’a pas besoin d’être formalisé par contrat (« contractualisation »)."
  },
  {
    "id": 30,
    "question": "Une sanction disciplinaire…",
    "choices": [
      "doit obligatoirement être notifiée par écrit et indiquer les faits reprochés au salarié.",
      "doit être notifiée au salarié dans les six mois suivant l’entretien préalable.",
      "peut être justifiée par des faits connus de l’employeur depuis moins d’un an.",
      "ne peut pas être annulée par le conseil de prud’hommes."
    ],
    "correctIndex": 0,
    "explication": "L’article L.1333-1 impose une notification écrite motivée ; à défaut, la sanction est nulle."
  },
  {
    "id": 31,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "Certaines professions, listées par le Code du travail, font l’objet d’une présomption irréfragable de salariat.",
      "Le statut d’« auto-entrepreneur » constitue une présomption simple de non-salariat.",
      "La dépendance économique existant entre les parties suffit à caractériser le contrat de travail.",
      "Le juge peut requalifier la relation en contrat de travail s’il constate un lien de subordination."
    ],
    "correctIndex": 2,
    "explication": "La dépendance économique n’établit pas, à elle seule, le lien de subordination requis pour le contrat de travail."
  },
  {
    "id": 32,
    "question": "Laquelle de ces affirmations est inexacte ?",
    "choices": [
      "Les accords de branche prévalent sur les accords d’entreprise pour certains sujets listés par la loi.",
      "Les accords collectifs peuvent déroger aux dispositions supplétives du Code du travail.",
      "Les accords collectifs ne peuvent jamais déroger aux dispositions du Code du travail.",
      "Sur les autres sujets, les accords d’entreprise priment même s’ils sont moins favorables."
    ],
    "correctIndex": 2,
    "explication": "Depuis la loi 2016-1088, la dérogation est possible hors ordre public absolu ou matières verrouillées ; l’assertion est donc fausse."
  },
  {
    "id": 33,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "Les accords collectifs peuvent être négociés au niveau national et interprofessionnel.",
      "Les accords collectifs doivent être validés par le ministère du Travail.",
      "Les accords collectifs sont des normes spécifiques au droit du travail.",
      "Les conventions collectives peuvent être négociées au niveau d’un secteur d’activité."
    ],
    "correctIndex": 1,
    "explication": "Une convention ou un accord collectif prend effet sans validation ministérielle ; seul l’arrêté d’extension relève de l’administration."
  },
  {
    "id": 34,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "Une modification de la rémunération constitue nécessairement une modification du contrat de travail.",
      "Un changement de lieu de travail constitue nécessairement une modification du contrat de travail.",
      "Un salarié ne peut pas être sanctionné pour avoir refusé une modification de son contrat.",
      "Un salarié peut être sanctionné pour avoir refusé un changement de ses conditions de travail."
    ],
    "correctIndex": 1,
    "explication": "Le changement de lieu est, en principe, un simple changement des conditions de travail dès lors qu’il reste dans le même secteur géographique."
  },
  {
    "id": 35,
    "question": "La rupture du contrat de travail pendant la période d’essai…",
    "choices": [
      "ne doit pas reposer sur un motif discriminatoire.",
      "implique la convocation du salarié à un entretien préalable.",
      "implique toujours un délai de prévenance d’une semaine.",
      "ne peut pas être à l’initiative du salarié."
    ],
    "correctIndex": 0,
    "explication": "La liberté de rompre l’essai est encadrée : elle ne doit pas être abusive ou discriminatoire ; entretien préalable et délai varient selon l’ancienneté."
  },
  {
    "id": 36,
    "question": "Le Code du travail limite la période d’essai initiale (hors renouvellement) pour les cadres à…",
    "choices": [
      "un mois",
      "quatre mois",
      "deux mois",
      "trois mois"
    ],
    "correctIndex": 1,
    "explication": "Art. L.1221-19 : quatre mois maximum pour les cadres, renouvelable une fois si prévu."
  },
  {
    "id": 37,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "L’OIT est le lieu de négociation de traités internationaux portant sur le droit du travail.",
      "Le but de l’OIT est de favoriser le « libre-échange » en harmonisant les droits de douane.",
      "L’OIT est une agence spécialisée de l’ONU.",
      "L’assemblée de l’OIT est dite « tripartite »."
    ],
    "correctIndex": 1,
    "explication": "L’objectif de l’OIT est d’améliorer la justice sociale et les conditions de travail, non de promouvoir le libre-échange douanier."
  },
  {
    "id": 38,
    "question": "Le Conseil constitutionnel…",
    "choices": [
      "contrôle la conformité des lois aux normes constitutionnelles.",
      "est composé de neuf membres nommés pour 9 ans et renouvelés par tiers.",
      "est le garant de la régularité des grandes élections.",
      "ne peut plus se prononcer sur la constitutionnalité d’une loi après sa promulgation."
    ],
    "correctIndex": 0,
    "explication": "Sa mission principale est le contrôle de constitutionnalité, exercé a priori et, depuis 2009, a posteriori via la QPC."
  },
  {
    "id": 39,
    "question": "Laquelle de ces propositions est inexacte ?",
    "choices": [
      "Le renouvellement de la période d’essai n’est pas possible si le contrat ne l’a pas prévu.",
      "Le renouvellement de la période d’essai nécessite l’accord du salarié.",
      "Le renouvellement doit être prévu par l’accord de branche.",
      "La période d’essai peut être renouvelée trois fois."
    ],
    "correctIndex": 3,
    "explication": "Le Code prévoit au maximum un seul renouvellement ; tripler l’essai est illégal."
  },
  {
    "id": 40,
    "question": "Selon le Conseil constitutionnel, les traités internationaux ont une valeur…",
    "choices": [
      "inférieure aux décrets.",
      "inférieure aux lois.",
      "inférieure à la Constitution.",
      "inférieure aux arrêtés."
    ],
    "correctIndex": 2,
    "explication": "Décision IVG (1975) : les traités ratifiés sont supérieurs aux lois mais demeurent hiérarchiquement sous la Constitution."
  },
  {
    "id": 41,
    "question": "La requalification d’un CDD en CDI peut être prononcée par le juge lorsque…",
    "choices": [
      "le motif de recours au CDD n’est pas précisé ou n’est pas réel et sérieux",
      "le salaire est inférieur au SMIC",
      "le CDD a été signé numériquement",
      "il s’agit d’un contrat saisonnier"
    ],
    "correctIndex": 0,
    "explication": "L’article L.1245-1 prévoit la requalification si le CDD ne comporte pas l’énoncé d’un motif valable ou si celui-ci est fictif ; la signature électronique et la nature saisonnière, en revanche, sont licites."
  },
  {
    "id": 42,
    "question": "Dans les entreprises de plus de 50 salariés, le règlement intérieur doit impérativement…",
    "choices": [
      "fixer les règles relatives à la santé et la sécurité",
      "déterminer le montant des primes d’ancienneté",
      "fixer le nombre de congés payés",
      "définir la grille des salaires"
    ],
    "correctIndex": 0,
    "explication": "Art. L.1321-1 : le règlement intérieur traite a minima de la santé/sécurité, de la discipline et des droits de la défense ; les primes et salaires relèvent d’autres textes."
  },
  {
    "id": 43,
    "question": "Constitue une situation de harcèlement moral…",
    "choices": [
      "un rappel à l’ordre ponctuel pour non-respect d’une procédure",
      "la mise en œuvre d’un PSE (plan social) avec mesures d’accompagnement",
      "une critique professionnelle exprimée une seule fois",
      "des agissements répétés ayant pour effet une dégradation des conditions de travail"
    ],
    "correctIndex": 3,
    "explication": "Le harcèlement moral suppose des agissements répétés entraînant une atteinte aux droits ou à la santé du salarié (art. L.1152-1)."
  },
  {
    "id": 44,
    "question": "Une clause de non-concurrence est valable si…",
    "choices": [
      "elle s’applique sans limite de durée",
      "elle ne prévoit aucune contrepartie financière",
      "elle est proportionnée, limitée dans le temps et l’espace et assortie d’une contrepartie financière",
      "elle est imposée unilatéralement après la signature du contrat"
    ],
    "correctIndex": 2,
    "explication": "Depuis la jurisprudence « Soc. 10 juil. 2002, n° 00-45135 », la clause doit être nécessaire à la protection des intérêts légitimes de l’entreprise, limitée et indemnisée."
  },
  {
    "id": 45,
    "question": "Les heures supplémentaires accomplies au-delà de la 35ᵉ heure hebdomadaire…",
    "choices": [
      "ouvrent droit à une majoration minimale de 25 % pour les 8 premières heures",
      "n’ouvrent droit à aucune majoration en présence d’un accord d’entreprise",
      "doivent obligatoirement être récupérées sous forme de repos compensateur intégral",
      "sont interdites dans les entreprises de moins de 20 salariés"
    ],
    "correctIndex": 0,
    "explication": "À défaut d’accord, les huit premières heures supplémentaires (36ᵉ à 43ᵉ) sont majorées de 25 % (art. L.3121-36)."
  },
  {
    "id": 46,
    "question": "Après signature d’une rupture conventionnelle, chacune des parties dispose d’un droit de rétractation de…",
    "choices": [
      "3 jours calendaires",
      "5 jours ouvrables",
      "7 jours calendaires",
      "15 jours ouvrables"
    ],
    "correctIndex": 3,
    "explication": "Art. L.1237-13 : délai de rétractation de 15 jours calendaires à compter de la signature (le texte parle de « jours calendaires », pas ouvrables)."
  },
  {
    "id": 47,
    "question": "Le licenciement économique collectif d’au moins 10 salariés sur 30 jours…",
    "choices": [
      "exige toujours une autorisation administrative préalable",
      "ne nécessite pas de plan de sauvegarde de l’emploi (PSE) si l’entreprise compte moins de 300 salariés",
      "nécessite un plan de sauvegarde de l’emploi lorsque l’entreprise a au moins 50 salariés",
      "peut être décidé sans consultation du CSE"
    ],
    "correctIndex": 2,
    "explication": "Art. L.1233-61 : PSE obligatoire dès 10 licenciements sur 30 jours dans une entreprise d’au moins 50 salariés."
  },
  {
    "id": 48,
    "question": "Un licenciement disciplinaire doit être notifié au salarié…",
    "choices": [
      "dans le délai maximal de 1 mois après l’entretien préalable",
      "dans le délai maximal de 2 mois après connaissance des faits fautifs",
      "par lettre recommandée motivée",
      "sans mention obligatoire des griefs"
    ],
    "correctIndex": 2,
    "explication": "Art. L.1232-6 : notification par LRAR énonçant précisément les motifs ; délai général de 1 mois concerne la sanction mais la réponse exacte reste la forme."
  },
  {
    "id": 49,
    "question": "Le secret médical…",
    "choices": [
      "est levé par la seule demande écrite de l’employeur",
      "incorpore les informations détenues par le médecin du travail",
      "ne couvre pas les informations communiquées à la médecine du travail",
      "n’est pas applicable dans l’entreprise"
    ],
    "correctIndex": 1,
    "explication": "Le médecin du travail est tenu au secret professionnel (art. R.4623-12) ; il ne peut transmettre que des conclusions d’aptitude, pas le diagnostic."
  },
  {
    "id": 50,
    "question": "Laquelle de ces juridictions est composée de juges non professionnels ?",
    "choices": [
      "Le tribunal judiciaire",
      "La cour criminelle départementale",
      "Le conseil de prud’hommes",
      "Le tribunal administratif"
    ],
    "correctIndex": 2,
    "explication": "Le conseil de prud’hommes est une juridiction paritaire où siègent des conseillers élus parmi les salariés et employeurs ; les autres formations comprennent des magistrats."
  }
]

// Cercle dynamique pour stats
function StatCircle({ value, max, color, label, labelColor }: { value: number, max: number, color: string, label: string, labelColor: string }) {
  const radius = 28;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const strokeDashoffset = circumference * (1 - percent);

  // Utilisation des classes Tailwind pour le mode sombre
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} className="drop-shadow-md">
          <circle
            className="dark:stroke-gray-700 dark:fill-gray-800"
            stroke="#f3f4f6"
            fill="#f9fafb"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span
          className="absolute text-base font-extrabold select-none"
          style={{ color: color, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {value}
        </span>
      </div>
      <span className="text-xs mt-1 font-medium" style={{ color: labelColor }}>{label}</span>
    </div>
  );
}

function App() {
  const QCM_SETS = [
    { name: '2025', data: QCM_QUESTIONS },
    { name: '2024', data: QCM_QUESTIONS_2024 },
  ];
  const [selectedQcm, setSelectedQcm] = useState(QCM_SETS[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [darkMode, setDarkMode] = useState(true); // sombre par défaut
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);

  const colors = darkMode
    ? {
      primary: '#6366f1', // indigo-500
      secondary: '#a21caf',
      background: '#18181b',
      text: '#f3f4f6',
      card: '#232336',
      border: '#312e81',
      progressBg: '#374151',
      statLabel: '#d1d5db',
      gradientStart: '#1e1b4b', // indigo-950
      gradientMiddle: '#1e1e3b',
      gradientEnd: '#0f172a', // slate-900
    }
    : {
      primary: '#6366f1',
      secondary: '#a21caf',
      background: 'white',
      text: '#111827',
      card: 'white',
      border: '#e0e7ff',
      gradientStart: '#f8fafc', // slate-50
      gradientMiddle: '#f1f5f9', // slate-100
      gradientEnd: '#e2e8f0', // slate-200
      progressBg: '#e5e7eb',
      statLabel: '#6b7280',
    };

  // Recharge et reset complet à chaque changement de QCM
  useEffect(() => {
    const shuffled = shuffleArray(selectedQcm.data);
    setQuestions(shuffled);
    setAnswers(Array(shuffled.length).fill(null));
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowAnswer(false);
    setQuizCompleted(false);
    setSelectedOption(null);
  }, [selectedQcm]);

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIndex);
  };

  const calculateFinalScore = () => {
    let rawScore = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctIndex) {
        rawScore += 1;
      } else if (answer !== null && strictMode) {
        rawScore -= 0.5;
      }
    });
    // Ne pas forcer à 0, pour permettre les scores négatifs
    return rawScore;
  };

  const getScoreOutOf20 = () => {
    const rawScore = calculateFinalScore();
    return (rawScore / questions.length) * 20;
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setShowAnswer(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);
    if (selectedOption === currentQuestion.correctIndex) {
      setScore(score + 1);
    } else if (strictMode) {
      setScore(score - 0.5);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray(questions));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowAnswer(false);
    setQuizCompleted(false);
    setAnswers(Array(questions.length).fill(null));
  };

  const getScoreMessage = () => {
    const finalScore = getScoreOutOf20();
    if (finalScore >= 16) return "Excellent !";
    if (finalScore >= 14) return "Très bien !";
    if (finalScore >= 12) return "Bien !";
    if (finalScore >= 8) return "Passable";
    return "À revoir";
  };

  const getStats = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    answers.forEach((answer, index) => {
      if (answer === null) {
        unanswered++;
      } else if (answer === questions[index].correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });
    return { correct, incorrect, unanswered };
  };

  if (quizCompleted) {
    const stats = getStats();
    const finalScore = getScoreOutOf20();
    const passed = finalScore >= 8;
    return (
      <div className={`${darkMode ? 'dark' : ''} min-h-screen flex items-center justify-center p-4 bg-pattern animated-gradient`}>
        <div className="rounded-xl shadow-2xl p-8 max-w-md w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80" 
          style={{ border: `1px solid ${colors.border}` }}>
          <div className="flex flex-col items-center">
            <Award className={`w-20 h-20 ${passed ? 'text-yellow-500' : 'text-gray-400'} mb-4`} />
            <h1 className="text-3xl font-bold text-center mb-2" style={{ color: colors.text }}>Quiz Terminé !</h1>
            <div className="w-full rounded-lg p-4 mb-4" style={{ background: colors.progressBg }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.text }}>Questions totales:</span>
                <span className="font-bold" style={{ color: colors.text }}>{questions.length}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.text }}>Bonnes réponses:</span>
                <span className="font-bold text-green-600">{stats.correct}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.text }}>Mauvaises réponses:</span>
                <span className="font-bold text-red-600">{stats.incorrect}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: colors.text }}>Sans réponse:</span>
                <span className="font-bold" style={{ color: colors.text }}>{stats.unanswered}</span>
              </div>
            </div>
            <div className="w-full rounded-full h-4 mb-4" style={{ background: colors.progressBg }}>
              <div
                className={`h-4 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${(finalScore / 20) * 100}%` }}
              ></div>
            </div>
            <p className="text-xl mb-2" style={{ color: colors.text }}>
              Note finale: <span className="font-bold">{finalScore.toFixed(1)}/20</span>
            </p>
            <h2 className={`text-2xl font-bold mb-8 ${passed ? 'text-green-600' : 'text-red-600'}`}>{getScoreMessage()}</h2>
            <button
              onClick={resetQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Recommencer le Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col items-center justify-center p-4 bg-pattern animated-gradient`}>
      {/* Titre, icône, toggle dark mode et sélecteur QCM */}
      <div className="flex justify-center w-full mb-4 max-w-5xl">
        <div className="rounded-xl shadow-lg p-4 flex flex-col items-center max-w-5xl w-full backdrop-blur-sm bg-white/90 dark:bg-gray-900/80" style={{ border: `1px solid ${colors.border}` }}>
          <div className="flex items-center gap-3 justify-center w-full">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-extrabold tracking-tight text-center flex-1" style={{ color: colors.text }}>Droit du travail</h1>
            {/* Toggle dark mode et sélecteur QCM */}
            <div className="flex items-center gap-2">
              <span>{darkMode ? <Moon className="w-6 h-6 text-indigo-600" /> : <Sun className="w-6 h-6 text-yellow-400" />}</span>
              <button
                onClick={() => setDarkMode((v) => !v)}
                className={`relative w-12 h-6 flex items-center rounded-full transition-colors duration-200 ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                aria-pressed={darkMode}
                title={darkMode ? 'Désactiver le mode sombre' : 'Activer le mode sombre'}
              >
                <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? 'translate-x-6' : ''}`}></span>
              </button>
              {/* Sélecteur QCM déplacé ici */}
              <select
                id="qcm-select"
                value={selectedQcm.name}
                onChange={e => {
                  const found = QCM_SETS.find(q => q.name === e.target.value);
                  if (found) setSelectedQcm(found);
                }}
                className="rounded-lg border border-indigo-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-200 font-bold shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {QCM_SETS.map(qcm => (
                  <option key={qcm.name} value={qcm.name}>{qcm.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Container pour la carte principale et les stats (côte à côte sur desktop, empilés sur mobile) */}
      <div className="flex flex-col lg:flex-row justify-center w-full max-w-5xl gap-4">
        {/* Card stats réponses/scores avec cercles dynamiques - Verticale sur desktop, horizontale sur mobile */}
        <div className="flex lg:flex-col mb-4 lg:mb-0 lg:w-1/5 order-1 lg:order-2">
          <div className="rounded-xl shadow-lg p-4 flex flex-wrap lg:flex-col items-center gap-8 w-full justify-center backdrop-blur-sm bg-white/90 dark:bg-gray-900/80" style={{ border: `1px solid ${colors.border}` }}>
            <StatCircle value={stats.correct} max={questions.length} color="#22c55e" label="Bonnes" labelColor={colors.statLabel} />
            <StatCircle value={stats.incorrect} max={questions.length} color="#ef4444" label="Mauvaises" labelColor={colors.statLabel} />
            <StatCircle value={stats.unanswered} max={questions.length} color="#6b7280" label="Non répondues" labelColor={colors.statLabel} />
            <StatCircle value={calculateFinalScore()} max={questions.length} color="#a21caf" label="Score" labelColor={colors.statLabel} />
          </div>
        </div>
        
        {/* Carte principale responsive */}
        <div className="rounded-2xl shadow-2xl p-6 max-w-3xl w-full relative border flex flex-col backdrop-blur-sm bg-white/90 dark:bg-gray-900/80 order-2 lg:order-1" style={{ borderColor: colors.border }}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium" style={{ color: colors.text }}>
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="w-full rounded-full h-2 mb-6" style={{ background: colors.progressBg }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, background: colors.primary }}
          ></div>
        </div>
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: colors.text }}>{currentQuestion.question}</h2>
        
        {/* Encart d'explication qui apparaît après avoir répondu */}
        {showAnswer && (
          <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 animate-fadeIn bg-opacity-20 
            ${selectedOption === currentQuestion.correctIndex 
              ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500' 
              : 'bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500'}`}>
            <Lightbulb className={`w-6 h-6 mt-1 flex-shrink-0 
              ${selectedOption === currentQuestion.correctIndex 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-amber-600 dark:text-amber-400'}`} />
            <div>
              <h3 className={`font-semibold mb-1 
                ${selectedOption === currentQuestion.correctIndex 
                  ? 'text-green-800 dark:text-green-400' 
                  : 'text-amber-800 dark:text-amber-400'}`}>
                {selectedOption === currentQuestion.correctIndex ? 'Bonne réponse !' : 'Explication :'}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{currentQuestion.explication}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3 mb-6">
          {currentQuestion.choices.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between gap-2 text-base font-medium shadow-sm
                ${selectedOption === index
                  ? showAnswer
                    ? index === currentQuestion.correctIndex
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                  : showAnswer && index === currentQuestion.correctIndex
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}
              `}
              disabled={showAnswer}
              style={{ color: colors.text }}
            >
              <span>{option}</span>
              {showAnswer && index === currentQuestion.correctIndex && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {showAnswer && selectedOption === index && index !== currentQuestion.correctIndex && (
                <X className="w-5 h-5 text-red-500" />
              )}
            </button>
          ))}
        </div>
        {!showAnswer ? (
          <div className="flex gap-2">
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className={`flex-1 py-3 rounded-lg font-bold transition-all text-lg shadow-md
                ${selectedOption === null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              `}
            >
              Vérifier
            </button>
            <button
              onClick={() => handleNextQuestion()}
              disabled={showAnswer}
              className="flex-1 py-3 rounded-lg font-bold transition-all text-lg shadow-md bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-500"
            >
              Passer
            </button>
          </div>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center text-lg shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Question Suivante' : 'Voir les Résultats'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        )}
        {/* Toggle mode strict sous la carte */}
        <div className="flex flex-col items-center gap-2 mt-8 self-center">
          <span className="text-sm" style={{ color: colors.text }}>Le mode strict retire 0,5 point pour chaque mauvaise réponse.</span>
          <div className="flex items-center gap-3">
            <span className="font-medium" style={{ color: colors.text }}>Mode strict</span>
            <button
              onClick={() => setStrictMode((v) => !v)}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors duration-200 ${strictMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
              aria-pressed={strictMode}
            >
              <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${strictMode ? 'translate-x-6' : ''}`}></span>
            </button>
            <span className={`ml-2 text-xs font-semibold ${strictMode ? 'text-indigo-600' : 'text-gray-400'}`}>{strictMode ? 'Activé' : 'Désactivé'}</span>
          </div>
        </div>
        {/* Bouton voir toutes les questions */}
        <button
          onClick={() => setShowQuestionsModal(true)}
          className="mt-8 w-full py-2 rounded-lg font-bold transition-all text-base shadow bg-gray-200 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-gray-800 dark:text-indigo-200 dark:hover:bg-indigo-900 dark:border-gray-700"
        >
          Voir toutes les questions
        </button>
        {/* Bouton recommencer en bas */}
        <button
          onClick={resetQuiz}
          className="mt-8 w-full py-2 rounded-lg font-bold transition-all text-base shadow bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-500"
        >
          Recommencer
        </button>
      </div>
    </div>
      {/* Vagues décoratives en bas de page */}
      <div className="wave"></div>
      {/* Modal questions */}
      {showQuestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-indigo-200 dark:border-gray-700 animate-fadeIn">
            <button
              onClick={() => setShowQuestionsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-2xl font-bold"
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700 dark:text-indigo-300">Toutes les questions</h2>
            <ol className="space-y-6">
              {selectedQcm.data.map((q, idx) => (
                <li key={q.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-300">{idx + 1}.</span>
                    <span className="font-semibold" style={{ color: colors.text }}>{q.question}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium text-green-700 dark:text-green-400">Bonne réponse :</span>
                    <span className="ml-2 font-semibold" style={{ color: colors.text }}>{q.choices[q.correctIndex]}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-medium text-indigo-700 dark:text-indigo-300">Explication :</span>
                    <span className="ml-2" style={{ color: colors.text }}>{q.explication}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;