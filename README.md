# allarmo

PWA statica per visualizzare conti alla rovescia. Gli avvisi vengono delegati al
Calendario tramite **SYNC CALENDAR**: non sono richiesti backend o notifiche push.

## Dati e recupero

I timer mantengono la chiave `allarmo_v4_2` e il formato JSON precedente (un array
di timer). Le foto ritagliate restano incluse nel JSON. I campi aggiuntivi dei
backup vengono conservati; `image` e `fired` possono mancare nei vecchi archivi.
Il file viene validato interamente prima di importarlo. Un'importazione valida
sostituisce l'elenco corrente, come nelle versioni precedenti: esportare prima
un backup se si vogliono conservare entrambi gli elenchi.

Se l'archivio non è leggibile, l'app si apre senza sovrascriverlo e **Export JSON**
scarica l'originale, anche se danneggiato. Le normali modifiche sono bloccate per
proteggerlo. Importando un backup valido viene richiesta conferma: prima della
sostituzione si conserva l'originale nella chiave locale
`allarmo_v4_2_recovery_<numero>`. Se non c'è spazio per conservarlo, l'importazione
si interrompe e l'originale resta al suo posto. Le copie di recupero non vengono
cancellate automaticamente e sono visibili negli strumenti del browser.

Un salvataggio fallito non applica creazioni, modifiche, eliminazioni o spostamenti.
Il form resta compilato per poter riprovare. Se un'altra finestra ha cambiato
l'archivio, l'app chiede di esportare i dati aperti e ricaricare, evitando di
sovrascrivere la versione rilevata. Il browser può comunque cancellare i dati
locali per scelta dell'utente o proprie politiche: mantenere backup JSON esterni.
Non cancellare i dati del sito per aggiornare l'app.

## Offline e pubblicazione

Servire via HTTPS (GitHub Pages) o localhost; `file://` non abilita il service worker.
Aprire una volta online e attendere il completamento dell'installazione della
cache. Le visite successive, anche dalla Home, possono aprire l'app offline.
Pagina, icona, Cropper 1.5.13 e gli stessi font Inter 400/600/800 e JetBrains Mono
500 sono locali e vengono precacheati insieme. Nessuna nuova libreria è richiesta.
Le foto selezionate e ritagliate nell'app sono dati locali e funzionano offline.
Eventuali immagini HTTP/HTTPS presenti in backup personalizzati richiedono la rete.
L'audio Mixkit già usato dall'app resta remoto e non è garantito offline.
Questi limiti non impediscono conto alla rovescia o generazione dei file ICS.

Ad ogni pubblicazione che cambia pagina o risorse, incrementare `CACHE_NAME` in
`sw.js`. La nuova cache viene preparata prima dell'attivazione; se il download
fallisce resta disponibile il worker precedente. L'attivazione elimina solo le
cache `allarmo-core-*` obsolete e la vecchia `allarmo-2026-core`, senza toccare
localStorage o le cache delle altre app sullo stesso dominio GitHub Pages.
Le navigazioni tentano prima la rete e ripiegano sulla pagina in cache se offline;
le risorse locali usano la cache della versione attiva. Il worker si aggiorna
all'apertura online, senza ricaricare forzatamente una pagina durante una modifica.
Dopo una nuova pubblicazione, riaprire online e poi riaprire/ricaricare la pagina
per usare il codice nuovo. La Home esistente usa lo stesso percorso di avvio.

## Calendario

L'ICS usa escaping TEXT e folding UTF-8 secondo RFC 5545, con UID, DTSTAMP, PRODID
e DESCRIPTION dell'avviso. Restano invariati: conversione dell'orario locale in
UTC, durata dell'evento di un minuto, avviso DISPLAY con `TRIGGER:-PT0M`.
Apostrofi e virgolette sono testo; virgole, punti e virgola, barre inverse e nuove
righe vengono codificati per iCalendar. La conferma finale dell'importazione e
degli avvisi richiede il Calendario su un iPhone reale.

## Risorse incluse

`vendor/cropper.min.{js,css}` sono le risorse già usate da cdnjs, versione 1.5.13
(licenza MIT in `vendor/cropper-LICENSE`). `vendor/fonts.css` e i file WOFF2 sono
le stesse famiglie, pesi e stile normale dell'URL Google Fonts originale,
scaricati il 23 ottobre 2026 (Inter v20, JetBrains Mono v24). Le rispettive
licenze OFL sono incluse in `vendor/Inter-OFL.txt` e `vendor/JetBrainsMono-OFL.txt`.
Il CSS dell'interfaccia, le etichette e le animazioni non sono stati modificati.
L'icona originale non è stata modificata; il manifest ne dichiara le dimensioni
effettive (819×848), correggendo il precedente valore 512×512.
