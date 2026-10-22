#!/usr/bin/env python3
"""Merge pinned bibliography observations and typed graphs without upgrading evidence.

Default rebuilds only the checked-in raw snapshot. --capture refreshes that snapshot
from the original workspace inputs. --check validates both schema/invariants and
byte-for-byte regeneration, without writing. No network or third-party modules.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import parse_qsl, unquote, urlencode, urlsplit, urlunsplit

APP = Path(__file__).resolve().parents[1]
SNAPSHOT = APP / "imports/source-records.json"
OUTPUTS = {"sources": APP / "data/sources.json", "graph": APP / "data/graph.json",
           "report": APP / "research/source-merge.md"}
REVIEW_DATE = "2026-10-22"
GROUPS = ("gateway", "patents", "software", "history", "measurement", "ai", "physics")
INPUTS = {
    "locationSources": "sphere-lab-repo/location-spectrum/public/data/sources.json",
    "locationGraph": "sphere-lab-repo/location-spectrum/public/data/graph.json",
    "positionEvidence": "position-review/device-observatory/position/src/evidence.json",
    "gatewaySources": "integration-panel/gateway/sources-v2.json",
    "historySources": "integration-panel/history/sources-v2.json",
    "historyGraph": "integration-panel/history/edges-v2.json",
}
GW_TITLES = {
    "GW-REPO": "The Gateway Files — pinned repository corpus",
    "GW-1983-OFFICIAL": "Analysis and Assessment of Gateway Process — CIA endpoint",
    "GW-1983-GOVINFO": "Analysis and Assessment of Gateway Process — official GovInfo scan",
    "GW-1983-SCAN": "Analysis and Assessment of Gateway Process — Black Vault mirror",
    "GW-1977-OFFICIAL": "Gateway Intermediate Workbook — CIA scan endpoint",
    "GW-1977-TEXT": "Gateway Intermediate Workbook — derivative text transcript",
    "MONROE-EARLY": "Early History and Development of the Monroe Institute",
    "MONROE-WAVE1": "Gateway Experience: Wave I — Discovery",
    "MONROE-COPPER2018": "The Copper Wall Project",
    "MONROE-COPPER2023": "Quasi-static Electric Fields of the Human Body: Copper Wall Research at the Monroe Institute",
    "INGENDOH2023": "Binaural beats to entrain the brain? A systematic review of the effects of binaural beat stimulation on brain oscillatory activity, and the implications for psychological research and intervention",
    "KIMI-GATEWAY": "Gateway Research — user-identified Kimi site (content unavailable; title not verified)",
    "CLEARHAT-ANNOTATED": "Analysis and Assessment of the Gateway Process — annotated/restored-page transcript lead (unread)",
}
DISPLAY_URLS = {
    "history:H7": "https://github.com/occult-kranti/gateway-files/blob/075bbab71bd4c83946fac1c3180dbc9460ce32d2/archive/FREQUENCY-RESEARCH.md",
    "history:H13": "./versions/location-v1.1/research/interpretation.md",
    "history:H14": "./research/panel/round1-gateway.md",
    "history:H15": "./research/panel/round1-inverse.md",
    "history:H16": "./research/panel/inverse-independent-fixtures.json",
    "history:H17": "./research/panel/round1-advisor.md",
    "history:H18": "https://github.com/occult-kranti/brainwave_opensync/blob/a8913c825d24299283c9379282ae3876e2a0c0cd/device-observatory/position/src/model.mjs",
    "location:project-design": "./research/working-thesis.md",
}
EVALUATIVE_TYPES = {
    "contradicted", "unverified", "unsupported", "lead", "qualifies", "limits",
    "does-not-establish", "requires-assumptions", "methodology-only", "confound",
    "analogy", "inspires", "synthetic-counterexample",
}
AUDIT_ALIAS = "integration-round3-audit:bridge-audit"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def encode(value):
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def first(record, *keys, default=""):
    for key in keys:
        value = record.get(key)
        if value is not None and value != "":
            return value
    return default


def canonical_url(url):
    """Conservative URL identity: preserve path case, versions, fragment and query.

    Remove only identified tracking keys. Do not remove arXiv version suffixes,
    git revision paths, patent publication IDs, ordinary query fields or slashes.
    """
    parts = urlsplit(str(url).strip())
    if parts.scheme.lower() not in ("http", "https"):
        return str(url).strip()
    # Hostname case is insensitive; the rest of netloc is retained verbatim.
    netloc = parts.netloc
    if parts.hostname:
        host = parts.hostname
        start = netloc.lower().rfind(host.lower())
        netloc = netloc[:start] + host.lower() + netloc[start + len(host):]
    tracking = {"fbclid", "gclid", "dclid", "mc_cid", "mc_eid", "_ga"}
    query = parse_qsl(parts.query, keep_blank_values=True)
    kept = [(k, v) for k, v in query if not (k.lower().startswith("utm_") or k.lower() in tracking)]
    # If no tracking was removed, keep even original query encoding/order.
    query_text = parts.query if kept == query else urlencode(kept, doseq=True)
    return urlunsplit((parts.scheme.lower(), netloc, parts.path, query_text, parts.fragment))


def canonical_doi(record):
    value = first(record, "doi", "DOI")
    if value:
        value = str(value).strip()
        value = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:\s*)", "", value, flags=re.I)
        return value.casefold()
    parts = urlsplit(str(record.get("url", "")))
    if (parts.hostname or "").lower() in ("doi.org", "dx.doi.org"):
        return unquote(parts.path.lstrip("/")).casefold()
    return ""


def group_for(origin, record):
    if origin == "gateway":
        return "gateway"
    text = " ".join(str(record.get(k, "")) for k in
                    ("id", "title", "kind", "type", "category", "channel", "topic", "venue")).casefold()
    url = str(record.get("url", "")).lower()
    if "patent" in url or re.match(r"^us\d", str(record.get("title", "")), re.I):
        return "patents"
    if any(x in text for x in ("software", "tool2-", "scipy", "pyfrf", "pyoma", "sfepy", "gmsh", "dolfinx")):
        return "software"
    if any(x in text for x in ("gateway", "monroe", "bentov", "purce", "stalking the wild pendulum", "mystic spiral")):
        return "gateway"
    if any(x in text for x in ("hist2-", "history-", "newton", "tesla", "general scholium", "principia", "opticks")):
        return "history"
    if any(x in text for x in ("openai", "anthropic", "neural operator", "machine learning", "inverse-learning", "bootloops", "ai-generated", "pde inverse", "physics-informed deep", "uai ", "aistats", "icml", "iclr", "neurips")):
        return "ai"
    if any(x in text for x in ("metrology", "measurement", "jcgm", "uncertainty", "vibrometry", "resonant ultrasound", "spectroscopy", "frf")):
        return "measurement"
    return "physics"


def version_qualifier(origin, record):
    """Never join an explicitly versioned software observation to an unknown one."""
    if group_for(origin, record) != "software":
        return ""
    fields = " ".join(str(record.get(k, "")) for k in ("title", "date", "venue", "version"))
    versions = sorted(set(re.findall(r"(?<![\w.])\d+\.\d+(?:\.\d+)?(?:[a-zA-Z][\w.-]*)?(?![\w.])", fields)))
    commit = first(record, "observedRepoCommit", "commit")
    return encode({"softwareVersions": versions, "inspectedCommit": commit}).strip() if versions or commit else ""


def cited_work(origin, record):
    return origin == "history" and record["id"] in ("H2", "H3")


def is_http_locator(value):
    parsed = urlsplit(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def validate_display_url(value, build_target=None):
    """Require public HTTP(S), or ./ links that resolve inside the build root.

    Source-stage validation checks both build input roots (app and public overlay).
    --build-target instead checks the actual assembled distribution directory.
    Original local identity locators are provenance, never display links.
    """
    if is_http_locator(value):
        return
    require(value.startswith("./"), f"Nonpublic or basepath-unsafe display URL: {value}")
    parsed = urlsplit(value)
    require(not parsed.scheme and not parsed.netloc, f"Invalid relative display URL: {value}")
    relative = Path(unquote(parsed.path[2:]))
    require(not relative.is_absolute() and ".." not in relative.parts, f"Display link escapes build root: {value}")
    candidates = [build_target / relative] if build_target else [APP / relative, APP / "public" / relative]
    require(any(path.is_file() for path in candidates), f"Display target missing from {'build' if build_target else 'build inputs'}: {value}")


def capture(workspace):
    raw, receipts = {}, {}
    for name, relative in INPUTS.items():
        path = workspace / relative
        payload = path.read_bytes()
        raw[name] = json.loads(payload)
        receipts[name] = {"path": relative, "sha256": hashlib.sha256(payload).hexdigest(), "bytes": len(payload)}
    def revision(relative):
        result = subprocess.run(["git", "-C", str(workspace / relative), "rev-parse", "HEAD"],
                                text=True, capture_output=True, check=True)
        return result.stdout.strip()
    return {"schemaVersion": "copper-source-import/1", "reviewDate": REVIEW_DATE,
            "scope": "Raw bibliographic and graph JSON only; no full books, Gateway transcript, audio or PDFs imported.",
            "originMetadata": {
                "location": {"sourceCommit": revision("sphere-lab-repo"), "reviewDate": REVIEW_DATE},
                "position": {"sourceCommit": revision("position-review"), "reviewDate": REVIEW_DATE},
                "gateway": {"sourceCommit": "075bbab71bd4c83946fac1c3180dbc9460ce32d2", "reviewDate": REVIEW_DATE},
                "history": {"sourceCommit": None, "reviewDate": REVIEW_DATE, "recordRevision": "sources-v2 / edges-v2; Round 2"}},
            "inputReceipts": receipts, "rawInputs": raw}


def records(snapshot):
    raw = snapshot["rawInputs"]
    result = []
    for origin, values in (("location", raw["locationSources"]),
                           ("position", raw["positionEvidence"]["sources"]),
                           ("gateway", raw["gatewaySources"]["sources"]),
                           ("history", raw["historySources"]["sources"])):
        result.extend((origin, item) for item in values)
    return result


def build(snapshot):
    rows = records(snapshot)
    imported_count = len(rows)
    # Restore the original graph's six dangling project-design evidence pointers
    # with an explicitly project-authored interpretation, not a primary source.
    rows.append(("location", {
        "id": "project-design", "title": "Project interpretation: location-spectrum connection graph",
        "url": "/devices/copper/research/working-thesis.md", "kind": "project-interpretation",
        "status": "Project-authored interpretation; not primary physical evidence",
        "readDepth": "Six original Location graph relations and current model/interpretation contracts",
        "claim": "Records the project’s comparison protocol, simulated controls and explicitly thematic patent connection.",
        "limitation": "An evidence pointer for the graph author's reasoning; no new observation, source endorsement or independently verified physical claim.",
        "reviewedAt": REVIEW_DATE,
    }))
    # DOI identity can be shared with a DOI-less record at exactly the same URL,
    # but never guessed from similar titles or a different mirror/edition.
    doi_by_url = defaultdict(set)
    for origin, record in rows:
        if not cited_work(origin, record) and canonical_doi(record):
            doi_by_url[canonical_url(record.get("url", ""))].add(canonical_doi(record))

    works, aliases, identity_by_alias = {}, {}, {}
    for origin, record in rows:
        alias = f"{origin}:{record['id']}"
        require(alias not in aliases, f"Duplicate qualified source alias {alias}")
        url = str(record.get("url", ""))
        display_url = DISPLAY_URLS.get(alias, url)
        canonical = canonical_url(url)
        doi = canonical_doi(record)
        if not doi and not cited_work(origin, record) and len(doi_by_url[canonical]) == 1:
            doi = next(iter(doi_by_url[canonical]))
        qualifier = version_qualifier(origin, record)
        if cited_work(origin, record):
            identity = "cited-work:" + ":".join(str(record.get(k, "")).casefold() for k in ("title", "author", "date"))
            identity_reason = "Distinct unread cited work; URL is only an attribution locator"
        else:
            identity = ("doi:" + doi) if doi else ("url:" + canonical)
            if qualifier:
                identity += "|software-version:" + qualifier
            identity_reason = "DOI (case-insensitive)" if doi else "Conservative URL"
            if qualifier:
                identity_reason += "; explicit software version/inspection revision retained"
        work_id = "work-" + digest(identity)[:20]
        aliases[alias] = work_id
        identity_by_alias[alias] = identity
        title = str(record.get("title") or GW_TITLES.get(record["id"]) or record["id"])
        description = str(first(record, "description", "claim", "claimRead", "finding", "limits", "limitation",
                                default="Source observation; inspect reading depth, status and limitations."))
        meta = snapshot["originMetadata"][origin]
        observation = {
            "origin": origin, "originalId": record["id"], "alias": alias,
            "title": title, "url": url, "status": first(record, "status", "kind", "category", default="Not specified"),
            "displayUrl": display_url, "originalLocatorPublic": is_http_locator(url),
            "locatorRole": "Source identity/provenance locator; not a public link" if not is_http_locator(url) else "Original supplied source locator",
            "readingDepth": first(record, "readDepth", "readingDepth", "read_depth", "access_read_depth", default="Not specified in imported record"),
            "limits": first(record, "limitation", "limits", "limit", "unresolved", default="Not specified in imported record"),
            "reviewDate": first(record, "reviewedAt", "accessed", "reviewDate", default=meta["reviewDate"]),
            "reviewDateBasis": "Explicit record field" if any(record.get(k) for k in ("reviewedAt", "accessed", "reviewDate")) else "Origin capture date; not inferred source publication date",
            "sourceCommit": meta.get("sourceCommit"), "sourceRevision": first(record, "version", "commit", "observedRepoCommit", default=meta.get("recordRevision")),
            "identityReason": identity_reason, "rawRecord": record,
        }
        if cited_work(origin, record):
            observation.update({"urlRole": "attribution-locator", "originalUrl": None, "readStatus": "UNREAD"})
        if work_id not in works:
            works[work_id] = {"id": work_id, "title": title, "url": display_url, "identityUrl": url, "group": group_for(origin, record),
                              "description": description, "observations": [], "aliases": [], "canonicalIdentity": identity}
            if doi:
                works[work_id]["doi"] = doi
        work = works[work_id]
        work["observations"].append(observation)
        work["aliases"].append(alias)
        if origin == "gateway":
            work["group"] = "gateway"
    # Preserve the original project interpretation observation in full. The
    # subsequent analytical review is a second observation of that same work,
    # not a replacement, an extra primary source or a new work identity.
    project_id = aliases["location:project-design"]
    audit_record = {
        "id": "bridge-audit", "title": "Integration Round 3 analytical audit of project inferences",
        "url": "./research/bridge-audit.md", "kind": "project-analytical-audit",
        "status": "Project analytical audit; not primary physical evidence",
        "readDepth": "Integrated bridge-audit.md, working-thesis.md, gateway-analysis.md; source/graph provenance and source UI rendering code; Gateway skill prose/references. Selected primary reading remains in its original observations.",
        "claim": "Audits the Planck speed/length inconsistency, ordinary turning points, quantum versus total acoustic energy, non-universal Q, frequency equality without coupling, and finite-model inverse/causal attribution limits.",
        "limitation": "Analytical and source-contract assessment; no physical measurement, human peer review, original-book-wide reading, universal physical-absence proof or new law certified.",
        "reviewedAt": REVIEW_DATE,
    }
    works[project_id]["observations"].append({
        "origin": "integration-round3-audit", "originalId": "bridge-audit", "alias": AUDIT_ALIAS,
        "title": audit_record["title"], "url": audit_record["url"], "displayUrl": audit_record["url"],
        "status": audit_record["status"], "readingDepth": audit_record["readDepth"],
        "limits": audit_record["limitation"], "reviewDate": REVIEW_DATE, "reviewDateBasis": "Explicit current audit date",
        "sourceCommit": None, "sourceRevision": "Round 3 integration audit; local review record",
        "identityReason": "Additional analytical observation of the existing project-interpretation work; no new identity",
        "originalLocatorPublic": True, "locatorRole": "Public app-relative analytical audit document",
        "evidenceKind": "project-analytical-audit", "rawRecord": audit_record,
    })
    works[project_id]["aliases"].append(AUDIT_ALIAS)
    aliases[AUDIT_ALIAS] = project_id
    source_list = sorted(works.values(), key=lambda item: (GROUPS.index(item["group"]), item["title"].casefold(), item["id"]))

    def source_ref(origin, original):
        qualified = f"{origin}:{original}"
        require(qualified in aliases, f"Unresolved evidence pointer {qualified}")
        return aliases[qualified]

    # A work node exists for each canonical source. Only an original node ID that
    # is itself a source alias can collapse to it; sourceId on a topic is metadata.
    nodes = {source["id"]: {"id": source["id"], "label": source["title"], "type": "source",
                            "group": source["group"], "sourceId": source["id"],
                            "description": source["description"], "url": source["url"], "originalNodes": []}
             for source in source_list}
    node_maps, edges, original_node_count = {}, [], 0

    def import_graph(origin, original_nodes, original_edges, prefix, original_scope):
        nonlocal original_node_count
        original_node_count += len(original_nodes)
        node_map = {}
        for original in original_nodes:
            old_id = original["id"]
            alias = f"{origin}:{old_id}"
            if alias in aliases:
                new_id = aliases[alias]
                nodes[new_id]["originalNodes"].append({"origin": origin, "node": original})
            else:
                new_id = f"{prefix}:{old_id}"
                require(new_id not in nodes, f"Duplicate graph node {new_id}")
                group = original.get("group") or original.get("type") or "physics"
                if group not in GROUPS:
                    group = "gateway" if origin == "history" and any(w in old_id for w in ("gateway", "bentov", "purce", "hologram", "torus", "information")) else "physics"
                node = {"id": new_id, "label": first(original, "label", "title", default=old_id),
                        "type": first(original, "kind", "type", default="topic"), "group": group,
                        "description": first(original, "description", "summary", default="Project-authored concept or model node; not primary evidence."),
                        "originalOrigin": origin, "originalNode": original}
                if original.get("sourceId"):
                    node["sourceId"] = source_ref(origin, original["sourceId"])
                nodes[new_id] = node
            node_map[old_id] = new_id
        node_maps[origin] = node_map
        for index, original in enumerate(original_edges):
            old_source = first(original, "source", "from")
            old_target = first(original, "target", "to")
            require(old_source in node_map and old_target in node_map,
                    f"Missing {origin} endpoint {old_source} -> {old_target}")
            refs = first(original, "sourceIds", "sources", "evidence", default=[])
            refs = [refs] if isinstance(refs, str) else list(refs)
            if original.get("sourceId"):
                refs.insert(0, original["sourceId"])
            require(refs, f"Edge without evidence pointer: {origin}:{index}")
            resolved = list(dict.fromkeys(source_ref(origin, ref) for ref in refs))
            relation = str(first(original, "relation", "label", "type", default="related"))
            edge_type = str(first(original, "type", default=relation))
            edge = {"id": f"{prefix}:edge:{original.get('id', index)}", "source": node_map[old_source],
                    "target": node_map[old_target], "type": edge_type, "relation": relation,
                    "label": str(first(original, "label", "relation", "scope", default=edge_type)),
                    "sourceId": resolved[0], "sourceIds": resolved,
                    "evidence": resolved, "scope": original.get("scope") or original_scope,
                    "originalOrigin": origin, "originalEdge": original,
                    "evidenceAliases": [f"{origin}:{ref}" for ref in refs]}
            edges.append(edge)

    raw = snapshot["rawInputs"]
    import_graph("location", raw["locationGraph"]["nodes"], raw["locationGraph"]["edges"], "oldL", raw["locationGraph"].get("scope"))
    position = raw["positionEvidence"]
    position_nodes = [{"id": row["id"], "label": row["title"], "kind": "source", "sourceId": row["id"]} for row in position["sources"]] + position["topics"]
    import_graph("position", position_nodes, position["edges"], "oldP", position.get("scope"))
    history = raw["historyGraph"]
    import_graph("history", history["nodes"], history["edges"], "history", history.get("scope"))
    # A primary text documents the claim; it does not author this project's
    # contradiction/qualification. Keep those citations and add the analytical
    # audit explicitly, as the primary evidence pointer for evaluative edges.
    audit_source = aliases["location:project-design"]
    for edge in edges:
        if edge["type"] in EVALUATIVE_TYPES:
            original_refs = list(edge["sourceIds"])
            edge["sourceIds"] = list(dict.fromkeys([audit_source] + original_refs))
            edge["sourceId"] = audit_source
            edge["evidence"] = list(edge["sourceIds"])
            if "location:project-design" not in edge["evidenceAliases"]:
                edge["evidenceAliases"].append("location:project-design")
            edge["evaluationProvenance"] = {"kind": "project-analytical-interpretation", "sourceId": audit_source,
                                           "observationAlias": AUDIT_ALIAS, "evidenceKind": "project-analytical-audit",
                                           "url": "./research/bridge-audit.md", "originalClaimSourceIds": original_refs}
            edge["evaluationNote"] = "This edge's evaluation is project-authored. Original citations retain their claim-specific scope; the analytical audit supplies the rejection, limitation or methodological mapping, not a new physical measurement."
    legend = dict(raw["locationGraph"].get("legend", {}))
    legend.update({"supported": "Supported only within the edge's named historical/model/measurement scope",
                   "contradicted": "A specific inference fails units, an explicit model counterexample or an identification requirement"})
    for edge in edges:
        legend.setdefault(edge["type"], f"Original relation: {edge['type']}; inspect origin, scope and source observations")
    graph = {"nodes": list(nodes.values()), "edges": edges, "legend": legend,
             "scope": "Curated project connection map, not a citation graph or proof of shared mechanism. All origin scopes and evidence observations are retained. Supported edges apply only within their stated scope; historical custody is not physical confirmation.",
             "sourceAliases": aliases, "asOf": REVIEW_DATE, "originalNodeCount": original_node_count,
             "evaluativeEdgeCount": sum(edge["type"] in EVALUATIVE_TYPES for edge in edges)}
    validate(snapshot, source_list, graph, imported_count)
    return source_list, graph, report(snapshot, source_list, graph, imported_count)


def validate(snapshot, sources, graph, imported_count):
    source_ids = {row["id"] for row in sources}
    require(len(source_ids) == len(sources), "Source IDs are not unique")
    aliases = {alias: row["id"] for row in sources for alias in row["aliases"]}
    require(sum(len(row["aliases"]) for row in sources) == imported_count + 2, "Alias count changed")
    expected = {f"{origin}:{row['id']}" for origin, row in records(snapshot)} | {"location:project-design", AUDIT_ALIAS}
    require(set(aliases) == expected, "An original source alias was lost or invented")
    require(aliases == graph["sourceAliases"], "Graph and bibliography aliases differ")
    for row in sources:
        require(row["group"] in GROUPS and row["title"] and row["url"], f"Invalid source display contract: {row['id']}")
        validate_display_url(row["url"])
        require(len(row["observations"]) == len(row["aliases"]), "Observation collapsed")
        for observation in row["observations"]:
            require(all(key in observation for key in ("readingDepth", "status", "limits", "reviewDate", "sourceCommit", "rawRecord")), "Incomplete observation")
    observations = {observation["alias"]: observation for row in sources for observation in row["observations"]}
    for origin, original in records(snapshot):
        observation = observations[f"{origin}:{original['id']}"]
        require(observation["rawRecord"] == original and observation["url"] == original["url"], "An imported observation or original URL changed")
    require(aliases[AUDIT_ALIAS] == aliases["location:project-design"], "Analytical audit created a new work identity")
    node_ids = {row["id"] for row in graph["nodes"]}
    require(len(node_ids) == len(graph["nodes"]), "Duplicate graph node IDs")
    require(len({row["id"] for row in graph["edges"]}) == len(graph["edges"]), "Duplicate edge IDs")
    for node in graph["nodes"]:
        require(not node.get("sourceId") or node["sourceId"] in source_ids, "Unresolved node evidence pointer")
        if node.get("url"):
            validate_display_url(node["url"])
        if node["type"] == "source":
            require(node["url"] == next(row["url"] for row in sources if row["id"] == node["sourceId"]), "Work node URL differs from public source URL")
    for edge in graph["edges"]:
        require(edge["source"] in node_ids and edge["target"] in node_ids, "Unresolved graph endpoint")
        require(edge["sourceId"] in source_ids and set(edge["sourceIds"]) <= source_ids, "Unresolved edge evidence")
        require(set(edge["evidence"]) == set(edge["sourceIds"]), "History evidence array lost sources")
        require(all(aliases[alias] in edge["sourceIds"] for alias in edge["evidenceAliases"]), "Incorrect evidence remap")
        if edge["type"] in EVALUATIVE_TYPES:
            require(edge["sourceId"] == aliases["location:project-design"] and edge.get("evaluationProvenance"), "Evaluative edge cites no analytical audit")
            require(edge["evaluationProvenance"].get("observationAlias") == AUDIT_ALIAS, "Evaluative edge lacks the current analytical observation")
    expected_edges = sum(len(snapshot["rawInputs"][name]["edges"]) for name in ("locationGraph", "positionEvidence", "historyGraph"))
    require(len(graph["edges"]) == expected_edges, "An original edge was lost")
    require(sum(edge["originalOrigin"] == "location" and edge["originalEdge"].get("sourceId") == "project-design" for edge in graph["edges"]) == 6, "Expected six original project-interpretation pointer repairs")
    require(aliases["history:H2"] != aliases["history:H1"] != aliases["history:H3"], "Cited books merged with report")


def report(snapshot, sources, graph, imported_count):
    counts = Counter(origin for origin, _ in records(snapshot))
    duplicates = [row for row in sources if len(row["aliases"]) > 1]
    lines = ["# Source and graph merge", "", f"Generated {REVIEW_DATE} by `scripts/merge_sources.py`. This is a reproducible metadata integration, not a source re-review, physical experiment or scientific endorsement.", "",
             f"**{imported_count} original source records** ({counts['location']} Location, {counts['position']} Position, {counts['gateway']} Gateway, {counts['history']} historical-panel), **one original project-interpretation observation**, and **one separate Round 3 analytical-audit observation** produce **{len(sources)} conservative work identities and {sum(len(row['observations']) for row in sources)} observations**. All 140 earlier observations remain auditable; the current audit is appended to the existing project work, not substituted or assigned a new work identity. Every record retains a qualified alias, original raw record, reading depth, status, limits, review date/basis and source commit/revision.", "",
             f"The graph has **{len(graph['nodes'])} unique nodes and {len(graph['edges'])} retained edges**. Original source nodes collapse only when their node ID itself matches an origin-qualified source alias. Other nodes retain `oldL:`, `oldP:` or `history:` namespaces, even if they happen to carry a sourceId. All work records also have a source node; some are intentionally unconnected.", "",
             "## Identity rules", "", "- DOI identity is case-insensitive. An exact shared URL may supply an explicitly recorded DOI to a DOI-less observation. Similar titles, mirror content, editions and guessed DOIs do not trigger merging.",
             "- URL identity lowercases the host and removes only explicit tracking parameters. Path case, arXiv suffixes, git revision paths, patent publication IDs, fragments, ordinary query fields and query order are retained. DOI identities are not used to erase explicit software version/inspection qualifiers.",
             "- Versioned software records retain explicit package versions and inspected repository revisions in identity and observations; unversioned README observations remain separate. An unversioned arXiv link is not silently identified with v1.",
             "- History H2/H3 are unread Bentov/Purce book leads. Their shared GovInfo URL is an attribution locator, not the original books' identity. They remain distinct cited-work records with originalUrl=null and readStatus=UNREAD. This explicitly documented exception avoids falsely merging either book into the inspected report.",
             "- Official GovInfo, CIA endpoint, Black Vault mirror and annotated lead remain distinct URL observations/identities unless their supplied canonical URL or DOI actually matches. Source custody and page-version reading differences remain inspectable.", "",
             "## Merged duplicate identities", "", "| Canonical work | Qualified original aliases | Identity |", "|---|---|---|"]
    for row in duplicates:
        identity = row["canonicalIdentity"].replace("|", " / ").replace("\n", " ")
        lines.append(f"| {row['title']} | {', '.join(row['aliases'])} | `{identity}` |")
    lines += ["", "Every duplicate observation retains its own reading/implementation status. For example, a reviewed abstract and a selected full-text reading do not become a blanket full-paper review after merging. Different software observations do not transfer execution status to each other.", "",
              "## Six repaired evidence pointers", "", "The original Location graph referenced absent `project-design` evidence six times. The new `location:project-design` record explicitly identifies project-authored reasoning about comparison protocols, simulated controls and a thematic patent relation. It is labelled project interpretation and not primary physical evidence. All six original edge objects, types and scope are preserved alongside their canonical evidence pointer.", "",
              "## Display links and analytical evaluations", "", "Public display URLs are separate from original identity locators. Seven imported local: locators and the original deployment-root project path remain unchanged in identityUrl and observation/raw provenance. Display links use pinned GitHub records or ./ paths resolved against the deployed app root, preserving any GitHub Pages base path. Work graph-node URLs match their source records. Local provenance strings are explicitly labelled nonpublic; an observation URL is not used as a display link.", "",
              f"The graph contains {graph['evaluativeEdgeCount']} evaluative/analogical edges. Each retains its original citations and now also points explicitly to the existing project work and its separately appended `{AUDIT_ALIAS}` observation. Its primary sourceId is that interpretation work; sourceIds/evidence retain all original claim evidence. Primary historical text does not itself prove this project's rejection. The original edge object is retained unchanged, and evaluationProvenance/evaluationNote identify the current analytical observation and its bounded scope.", "",
              "## Raw imports and regeneration", "", "`imports/source-records.json` preserves all six raw JSON inputs and capture receipts (path, SHA-256 and bytes), plus origin commits. It includes bibliographic/graph metadata only; no full Gateway transcript, PDF, commercial audio or book was imported. Gateway display titles were supplied by the Gateway source seat; inaccessible-site and unread-transcript qualifiers remain in those titles.", "", "```sh", "python scripts/merge_sources.py", "python scripts/merge_sources.py --check", "python scripts/merge_sources.py --check --build-target dist", "```", "", "The default validates relative targets against the app/public build inputs. The build-target option checks the actual assembled output and must be run after its build/copy step.", "", "To intentionally refresh the original workspace snapshot:", "", "```sh", "python scripts/merge_sources.py --capture --workspace-root /workspace/scratch/c230cc629529", "```", "",
              "`--check` writes nothing. It verifies exact regeneration, unique source/node/edge IDs, complete alias/observation coverage, all endpoints, all sourceId/sourceIds/evidence pointers and the six interpretation repairs. Internal identity controls cover DOI case, nontracking queries, path case, arXiv/git/patent/software versions and the cited-book collision.", "",
              "Groups exposed to the frontend are `gateway`, `patents`, `software`, `history`, `measurement`, `ai`, `physics`. Grouping is navigational and carries no evidence grade. The source array contract is id/title/url/group/description/observations/aliases; the graph retains nodes/edges/legend/scope plus original provenance.", "",
              "## Remaining boundaries", "", "This conservative merge can retain separate identities for the same intellectual work when only different mirrors or a DOI-less publication URL were supplied. That is preferable to asserting unverified equivalence. Capture/review dates are distinguished from publication dates; null sourceCommit for local panel reports is explicit. The raw original record is authoritative for any nuance not represented by normalized display fields. No stronger reading depth, completed theorem, calibrated apparatus result or novel physical law is inferred by the merger.", ""]
    return "\n".join(lines)


def identity_controls():
    require(canonical_doi({"url": "https://doi.org/10.1103/PhysRevLett.132.066003"}) == canonical_doi({"doi": "10.1103/physrevlett.132.066003"}), "DOI case control")
    require(canonical_url("https://EXAMPLE.org/Case?q=A&utm_source=x") == "https://example.org/Case?q=A", "Tracking/query control")
    require(canonical_url("https://example.org/Case?q=A") != canonical_url("https://example.org/case?q=A"), "Path case control")
    for first_url, second_url in (("https://arxiv.org/abs/2610.22367v1", "https://arxiv.org/abs/2610.22367"),
                                  ("https://github.com/a/b/blob/abc/x", "https://github.com/a/b/blob/def/x"),
                                  ("https://patents.google.com/patent/US1A/en", "https://patents.google.com/patent/US1B2/en")):
        require(canonical_url(first_url) != canonical_url(second_url), "Version identity control")
    require(version_qualifier("position", {"title": "pyFRF", "kind": "software"}) != version_qualifier("location", {"title": "pyFRF 1.5.0", "kind": "software"}), "Software version control")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--capture", action="store_true", help="refresh raw snapshot from original workspace inputs")
    parser.add_argument("--workspace-root", type=Path, default=APP.parent.parent)
    parser.add_argument("--check", action="store_true", help="validate and require byte-identical existing outputs; no writes")
    parser.add_argument("--build-target", type=Path, help="also require all relative display URLs to exist in the assembled output")
    args = parser.parse_args()
    require(not (args.capture and args.check), "--capture and --check are separate actions")
    identity_controls()
    snapshot = capture(args.workspace_root) if args.capture else json.loads(SNAPSHOT.read_text())
    sources, graph, narrative = build(snapshot)
    if args.build_target:
        for row in sources:
            validate_display_url(row["url"], args.build_target)
        for node in graph["nodes"]:
            if node.get("url"):
                validate_display_url(node["url"], args.build_target)
    values = {"sources": encode(sources), "graph": encode(graph), "report": narrative}
    if args.check:
        for key, path in OUTPUTS.items():
            require(path.read_text() == values[key], f"Output differs from deterministic merge: {path.name}")
            if args.build_target:
                built_path = args.build_target / path.relative_to(APP)
                require(built_path.read_text() == values[key], f"Built output is stale: {built_path}")
    else:
        if args.capture:
            SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
            SNAPSHOT.write_text(encode(snapshot))
        for key, path in OUTPUTS.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(values[key])
    print(json.dumps({"status": "validated" if args.check else "merged and validated", "originalRecords": len(records(snapshot)),
                      "projectInterpretations": 1, "analyticalAuditObservations": 1, "workIdentities": len(sources), "observations": sum(len(x['observations']) for x in sources),
                      "nodes": len(graph['nodes']), "edges": len(graph['edges']), "groups": list(GROUPS)}))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError) as error:
        print(f"Merge failed: {error}", file=sys.stderr)
        sys.exit(1)
