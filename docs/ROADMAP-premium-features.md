# Roadmap: Premium Summarisation Features

This document outlines potential premium/advanced summarisation options that could be added to the LLM Summarizer plugin in future versions.

## Current Free Features (v1.2.0)

### Single Item
- **Individual Summary**: Generate a structured research note for one item's notes

### Multi-Item / Collection
- **Batch Individual**: Process each item separately, creating one summary note per item
- **Simple Digest**: Collate raw notes from all selected items into a single digest (no additional analysis)

---

## Proposed Premium Features

### 1. Comparative Analysis
**Description**: Generate a single summary that explicitly compares and contrasts the selected papers.

**Use case**: Understanding how different studies approach the same research question, identifying methodological differences, comparing findings.

**Output structure**:
- Common themes across papers
- Key differences in approach/methodology
- Contradictory findings
- Complementary insights
- Synthesis of implications

**Implementation notes**:
- Requires modified prompt emphasising comparison
- Higher token usage due to analytical requirements
- Best suited for 2-5 closely related papers

---

### 2. Literature Review Synthesis
**Description**: Combine all papers into a cohesive literature review paragraph or section.

**Use case**: Thesis writing, grant applications, manuscript preparation where a flowing narrative is needed rather than bullet points.

**Output structure**:
- Introductory framing of the research area
- Chronological or thematic organisation of sources
- Proper academic transitions between sources
- Identification of the "conversation" between papers
- Gap identification for future research

**Implementation notes**:
- Requires sophisticated prompt for academic writing style
- May need user input on review focus/angle
- Could offer different styles (systematic review, narrative review, scoping review)

---

### 3. Thematic Analysis
**Description**: Identify and organise common themes, patterns, and divergences across the corpus.

**Use case**: Qualitative research synthesis, identifying emerging patterns in a field, mapping conceptual territories.

**Output structure**:
- Major themes identified (with paper citations)
- Sub-themes and relationships
- Frequency/prominence of themes
- Outlier perspectives
- Visual theme map (if possible)

**Implementation notes**:
- Iterative process may be needed (identify themes, then re-analyse)
- Could integrate with Zotero tags for theme tracking
- May benefit from multi-pass analysis

---

### 4. Research Gap Analysis
**Description**: Systematically identify gaps, opportunities, and under-explored areas across the selected literature.

**Use case**: PhD students identifying thesis topics, researchers planning new studies, funding applications.

**Output structure**:
- Methodological gaps (what methods haven't been used?)
- Conceptual gaps (what theories need testing?)
- Empirical gaps (what populations/contexts are missing?)
- Temporal gaps (what needs updating?)
- Suggested research questions

**Implementation notes**:
- Requires deep analytical prompt
- Would benefit from domain-specific knowledge
- Could cross-reference with existing research databases

---

### 5. Meta-Analysis Summary
**Description**: For quantitative studies, extract and summarise statistical findings, effect sizes, and methodological quality.

**Use case**: Researchers conducting systematic reviews, evidence synthesis.

**Output structure**:
- Study characteristics table
- Effect sizes and confidence intervals
- Methodological quality assessment
- Heterogeneity observations
- Forest plot data (exportable)

**Implementation notes**:
- Requires structured data extraction
- May need validation against actual meta-analysis tools
- Limited to quantitative studies
- Higher complexity and cost

---

### 6. Citation Network Mapping
**Description**: Analyse citation patterns across selected papers to identify foundational works, intellectual lineages, and citation clusters.

**Use case**: Understanding a field's intellectual history, identifying seminal works, finding related papers.

**Output structure**:
- Foundational/seminal works cited by multiple papers
- Citation clusters (groups of commonly co-cited papers)
- Intellectual lineages (who builds on whom)
- Bridge papers (connecting different research streams)
- Suggested papers to read based on citation patterns

**Implementation notes**:
- Could integrate with Zotero's related items feature
- May need to access reference lists (if available)
- Could generate visual citation network

---

## Implementation Considerations

### Monetisation Options (for Zotero plugins)

1. **Freemium model**: Basic features free, premium features require license key
2. **Usage-based**: Free tier with X summaries/month, premium for unlimited
3. **One-time purchase**: Unlock premium features permanently
4. **Donation-ware**: All features available, suggest donation for heavy users

**Technical challenges**:
- Zotero plugins don't have built-in payment/licensing infrastructure
- Would need external license validation server
- Consider privacy implications of license checks

### Alternative Approaches

1. **Separate premium plugin**: Keep free plugin as-is, create separate "LLM Summarizer Pro"
2. **Web service integration**: Premium features processed via web API (allows for usage tracking)
3. **Feature flags via preferences**: Unlock codes entered in preferences

---

## Priority Assessment

| Feature | Complexity | User Value | Token Cost | Priority |
|---------|------------|------------|------------|----------|
| Comparative Analysis | Medium | High | Medium | **High** |
| Literature Review Synthesis | Medium | High | Medium | **High** |
| Thematic Analysis | High | Medium | High | Medium |
| Research Gap Analysis | High | High | High | Medium |
| Meta-Analysis Summary | Very High | Medium | High | Low |
| Citation Network Mapping | High | Medium | Medium | Low |

---

## Next Steps

1. Validate demand for premium features with users
2. Research Zotero plugin monetisation precedents
3. Design licensing/activation system
4. Implement Comparative Analysis as first premium feature
5. Gather feedback and iterate

---

*Document created: January 2026*
*Last updated: v1.2.0*
