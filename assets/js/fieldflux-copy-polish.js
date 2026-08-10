(function(){
  "use strict";
  if(window.__fieldfluxCopyPolish)return;
  window.__fieldfluxCopyPolish=true;

  var replacements=[
    ["Physical truth enters only here.","Here the physical world contributes its answer."],
    ["The proof corpus is not decoration around the product. It is the machine-checkable contract that keeps definitions, laws, transformations, admissibility, and measurement claims from drifting apart as the system grows.","The proof corpus is infrastructure beneath the product: a machine-checkable contract that keeps definitions, laws, transformations, admissibility, and measurement claims aligned as the system grows."],
    ["Route-consistent movement resolves into fields, gradients, laminar structure, residuals, and local departures that can be inspected instead of compressed away.","Route-consistent movement resolves into fields, gradients, laminar structure, residuals, and local departures, preserving both the reconstructed whole and the structure within it."],
    ["QPCI is a measurement architecture for distributed physiological response. It begins with a source, preserves the timing and provenance of what follows, and refuses to grant more authority than the evidence can support.","QPCI is a measurement architecture for distributed physiological response. It begins with a source, preserves the timing and provenance of what follows, and grants authority in proportion to the evidence carried with each result."],
    ["The stages below remain one object. Nothing important disappears when the next layer forms.","The stages below remain one object. Each layer carries forward the structure required by the next."],
    ["A beautiful field can still be unresolved.","A field becomes authoritative when its evidence closes."],
    ["Fieldflux keeps numerical resolution separate from evidentiary authority. A result can look precise and still be withheld if the witnesses, coverage, calibration, scope, or provenance required for the claim are missing.","Fieldflux tracks numerical resolution and evidentiary authority as distinct states. Claim authority emerges when witnesses, coverage, calibration, scope, and provenance close around the result."],
    ["Where does the inference stop being stable?","What is the stable scope of inference?"],
    ["The hardware changes the granularity and strength of evidence, not the identity of the measurement object.","The measurement object remains invariant as hardware increases granularity and physical witness."],
    ["Proof can establish that a formal statement follows from a formal system. It cannot by itself establish that nature obeys that statement. The chain stays explicit so those two kinds of truth never get silently merged.","Proof establishes what follows within the declared formal system. Physical truth enters through interpretation, engineering, and empirical measurement. The chain keeps each achievement explicit and connected."],
    ["The research notebook records why the formal architecture exists, where measurements fail, and what the instruments are actually allowed to say.","The research notebook records why the formal architecture exists, where measurement reaches its limits, and how evidence determines the scope of each claim."],
    ["The product line becomes clearer when applications and measurement instruments are separated. They share one formal foundation without pretending to be the same thing.","The product line is organized into applications and measurement instruments. Both inherit one formal foundation and carry different roles in the evidence chain."],
    ["HealthKit-derived measurements form the everyday state. DRTT scan evidence can deepen the relational picture when present; it is not required for the core daily reading.","HealthKit-derived measurements form the everyday state. DRTT scan evidence, when present, contributes a deeper relational layer through a defined interface."],
    ["Each layer removes a different kind of uncertainty. None of them silently substitutes for the next.","Each completed layer retires its own class of uncertainty and prepares the next."],
    ["Prospective validation remains the work that determines which physiological and clinical claims can be granted. Authority is withheld when evidence is insufficient.","Prospective validation determines which physiological and clinical claims earn authority. Claim scope grows as the required evidence closes."],
    ["More evidence, not a change of story.","The next layer of evidence."],
    ["Reproducing the surface product does not reproduce the ontology, proof architecture, measurement contracts, source-witnessed hardware, packet semantics, or the empirical program required to support the same claims.","Defensibility accumulates across the dependency chain: the ontology, proof architecture, measurement contracts, source-witnessed hardware, packet semantics, and empirical program required to support the same claims."],

    ["ontology, proof, physical interpretation, and engineering can all be coherent while nature still remains unanswered","ontology, proof, physical interpretation, and engineering form a coherent question ready for empirical contact"],
    ["engineering can ask","engineering asks"],
    ["only measurement can answer","measurement returns the answer"],
    ["the observed world can agree, disagree, weaken the claim, or leave it unresolved","the observed world returns support, revision, a narrower scope, or an unresolved state"],
    ["The formal object remains intact; the question changes from internal consequence to proposed physical meaning.","The formal object carries forward into a new question: what physical relationships would instantiate it?"],
    ["Whether relational movement stays route-consistent and flowing or requires repeated correction.","How route-consistent flow is preserved, and where repeated correction enters the movement."],
    ["How parts of the field align with repeated external forcing, and where that alignment does not occur.","How parts of the field align with repeated external forcing, including the extent and boundaries of that alignment."],
    ["deletion tests can remove authority without removing numerical resolution","deletion tests reveal how evidence changes claim authority while the numerical state remains resolved"],
    ["The field can remain numerically resolved while missing coverage removes authority for the larger claim.","The numerical field remains resolved; available coverage sets a narrower authority boundary for the claim."],
    ["Without an independently witnessed source, the response can no longer support the same causal measurement claim.","Source witness determines whether the response carries causal measurement authority. Removing it narrows the result to the observed response itself."],
    ["Without valid calibration, the numerical object persists but its physical interpretation is weakened beyond the authorized scope.","Calibration ties the numerical object to physical interpretation. Removing it contracts the authorized physical scope."],
    ["Qualified evidence can deepen interpretation without collapsing the acquisition paths.","Qualified evidence deepens interpretation through a defined interface."],
    ["Applications and instruments remain distinct. They meet only where the formal contracts specify how evidence may enter, what provenance must travel with it, and which interpretation is allowed to change.","Applications and instruments preserve their own acquisition paths. Their shared formal contracts specify how evidence enters, what provenance travels with it, and how interpretation may update."],
    ["Capital moves the frontier; it does not restart the chain.","Capital moves the frontier forward from the work already completed."],
    ["The map preserves the conceptual relationships between the essays instead of presenting them only as a chronology.","The map preserves the conceptual relationships between the essays and reveals the genealogy beneath their chronology."],

    ["Fieldflux Biosystems started from a question medicine never formally answered: what does being 'healthy' actually mean? We wrote that definition down — as mathematics a computer can verify — and then built the instruments to read it.","Fieldflux Biosystems began with a foundational question: what does being 'healthy' actually mean? We defined health mathematically, encoded the structure in a form a computer can verify, and built instruments that can interrogate it."],
    ["You cannot honestly measure health until you have said, precisely, what it is. The definition comes first; every instrument is downstream of it.","Measurement begins with a precise definition of health. Every instrument is downstream of that definition."],
    ["Proven, not inferred","Replayable by construction"],
    ["Our science is a deterministic analytic surrogate — a defined function of its inputs — not a trained model.","Our science is a deterministic analytic surrogate: a defined function of its inputs."],
    ["Measurement, not diagnosis","Measurement with explicit scope"],
    ["We form images, maps, and fields of the body's response. We do not output diagnoses or treatment instructions — by design.","We form images, maps, and fields of the body's response within an explicit measurement scope. Diagnostic and treatment decisions remain in their appropriate clinical context."],
    ["Foundational work rewards depth over headcount.","Foundational work demands depth."],
    ["Depth over headcount.","Depth, rigor, and a short feedback loop."],
    ["Foundational work rewards a few people who go very deep, talking to each other constantly, over a large team that can't.","Foundational work rewards a small senior team working deeply across disciplines, with constant communication and a short feedback loop."],
    ["We prize rigor, taste, and the humility to say what we don't yet know.","We prize rigor, taste, and the humility to name the frontier of what we know."],
    ["We're always interested in exceptional people in these areas — whether or not a role is posted.","We're always interested in exceptional people in these areas, including people whose fit may precede a formal posting."],
    ["No posting? Tell us anyway.","Exceptional fit comes first."],
    ["We hire for exceptional fit more often than for a fixed slot. Send us who you are, what you've built, and the problem you'd want to own — a link to real work says more than a résumé.","We hire when exceptional fit meets an important problem. Send us who you are, what you've built, and the problem you'd want to own — a link to real work says more than a résumé."],

    ["In health, integrity can't be a policy you add at the end — it has to be built into the mathematics. Ours is. Here is what we hold ourselves to, and how the system enforces it.","In health, integrity belongs inside the construction of the measurement itself. We build it into the mathematics, evidence contracts, and runtime behavior. Here is what we hold ourselves to, and how the system enforces it."],
    ["We form images, maps, and fields of the body's boundary response. We do not output diagnoses, treatment instructions, or clinical rule-in / rule-out determinations.","We form images, maps, and fields of the body's boundary response within an explicit measurement scope. Diagnostic, treatment, and clinical rule-in / rule-out decisions remain in their appropriate clinical context."],
    ["Rigor isn't only in the math — it's in how honestly a result reports its own strength.","Rigor lives in the mathematics and in the way each result reports its own strength."],
    ["Nothing unaccounted for","Complete provenance"],
    ["It never claims more than it knows","Authority follows evidence"],
    ["Results carry an evidentiary-maturity grade, and no part of the system may label an output stronger than the witnessed evidence supports. Honesty is enforced, not requested.","Results carry an evidentiary-maturity grade, and the system grants claim strength in proportion to the witnessed evidence. That relationship is enforced in the runtime."],
    ["No black box, no drift","Deterministic and replayable"],
    ["The engine is a deterministic analytic surrogate, not a trained model. Every result is a defined function of its inputs — reproducible exactly, with no silent model updates changing what your numbers mean.","The engine is a deterministic analytic surrogate: a defined function of its inputs. Every result is exactly reproducible, with versioned semantics that preserve what the numbers mean."],
    ["We collect what the measurement needs and no more.","We collect the minimum data defined by the measurement contract."],
    ["Data dignity as a default, not a setting.","Data dignity is part of the default architecture."],

    ["As the science opens up, we share the odd essay and milestone — no noise, easy to leave.","As the science develops, we share occasional essays and milestones when there is something worth sending."],
    ["Measurement, not diagnosis.","Measurement with explicit scope."]
  ];

  function transformText(text){
    var out=text;
    replacements.forEach(function(pair){if(out.indexOf(pair[0])!==-1)out=out.split(pair[0]).join(pair[1]);});
    return out;
  }

  function polishNode(node){
    if(!node)return;
    if(node.nodeType===3){
      var p=node.parentElement;
      if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(p.tagName))return;
      var next=transformText(node.nodeValue||"");
      if(next!==node.nodeValue)node.nodeValue=next;
      return;
    }
    if(node.nodeType!==1)return;
    if(/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(node.tagName))return;
    var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    var t;while((t=walker.nextNode()))polishNode(t);
  }

  function targeted(){
    document.querySelectorAll(".ffx-proofgrid div").forEach(function(cell){
      var label=cell.querySelector("span"),value=cell.querySelector("b");
      if(label&&value&&label.textContent.trim()==="hidden model training"){
        value.textContent="Defined";
        label.textContent="deterministic analytic pipeline";
      }
    });

    document.querySelectorAll(".footer__bottom p").forEach(function(p){
      if(/Measurement, not diagnosis\./.test(p.textContent))p.textContent="Measurement with explicit scope.";
    });

    var ethicsMeta=document.querySelector('meta[name="description"]');
    if(ethicsMeta&&/measurement not diagnosis|no black box|no drift/i.test(ethicsMeta.content)){
      ethicsMeta.content="Fieldflux builds integrity into the measurement architecture: explicit scope, witness-qualified data, graded evidence, deterministic computation, and replayable provenance.";
    }
  }

  function run(){polishNode(document.body);targeted();}
  run();
  setTimeout(run,120);setTimeout(run,500);setTimeout(run,1200);

  var queued=false;
  var observer=new MutationObserver(function(records){
    records.forEach(function(r){
      if(r.type==="characterData")polishNode(r.target);
      else Array.prototype.forEach.call(r.addedNodes||[],polishNode);
    });
    if(!queued){queued=true;requestAnimationFrame(function(){queued=false;targeted();});}
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
})();
