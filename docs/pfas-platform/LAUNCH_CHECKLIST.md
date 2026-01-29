# Launch Checklist

Pre-launch validation checklist for PFAS-Free Kitchen platform.

## Content Readiness

- [ ] 500 products loaded across all 5 categories
- [ ] 100% products have verification tier
- [ ] 100% products have ≥1 evidence object
- [ ] 80%+ products at Tier 1+
- [ ] All categories have ≥20 products

### Category Coverage

| Category | Target | Actual | Status |
|----------|--------|--------|--------|
| Cookware | 100 | ___ | ⬜ |
| Bakeware | 100 | ___ | ⬜ |
| Food Storage | 100 | ___ | ⬜ |
| Utensils | 100 | ___ | ⬜ |
| Appliances | 100 | ___ | ⬜ |

### Tier Distribution

| Tier | Target % | Actual % | Status |
|------|----------|----------|--------|
| Tier 4 (Monitored) | 5% | ___ | ⬜ |
| Tier 3 (Lab Tested) | 15% | ___ | ⬜ |
| Tier 2 (Policy Reviewed) | 30% | ___ | ⬜ |
| Tier 1 (Brand Statement) | 30% | ___ | ⬜ |
| Tier 0 (Unknown) | ≤20% | ___ | ⬜ |

## Compliance

### Legal Review

- [ ] Legal review: Terms of Service
- [ ] Legal review: Privacy Policy
- [ ] Legal review: Affiliate Disclosure page
- [ ] Legal review: Claim language in Playbook
- [ ] Legal sign-off received: _____________ (date)

### FTC Compliance

- [ ] FTC disclosure on category grids: VERIFIED
- [ ] FTC disclosure on PDP near buttons: VERIFIED
- [ ] FTC disclosure in click-out modal: VERIFIED
- [ ] FTC disclosure in footer link: VERIFIED
- [ ] Disclosure language reviewed by legal: VERIFIED

### Amazon Associates Compliance

- [ ] Amazon Associates account approved
- [ ] Account ID: _____________ 
- [ ] Amazon links tested (open correct product)
- [ ] No Amazon prices displayed: VERIFIED
- [ ] No Amazon reviews displayed: VERIFIED
- [ ] Correct tag parameter in all links: VERIFIED

### Other Affiliate Networks

- [ ] Impact account approved
- [ ] CJ Affiliate account approved
- [ ] All retailer links tested and functional

## Technical

### Error & Empty States

- [ ] All error states implemented
- [ ] 404 page implemented
- [ ] 500 page implemented
- [ ] All empty states implemented
- [ ] No products state handled
- [ ] Filter no results state handled

### Performance

- [ ] Lighthouse audit: LCP < 2.5s
- [ ] Lighthouse audit: FID < 100ms
- [ ] Lighthouse audit: CLS < 0.1
- [ ] Performance score ≥ 90

### Accessibility

- [ ] axe-core accessibility audit passed
- [ ] Keyboard navigation verified
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG 2.2 AA
- [ ] Focus indicators visible

### Security

- [ ] Security scan: no critical vulnerabilities
- [ ] Security scan: no high vulnerabilities
- [ ] HTTPS configured
- [ ] CSP headers configured
- [ ] Rate limiting enabled

### Data Integrity

- [ ] Evidence integrity check: all hashes valid
- [ ] Search index: all published products indexed
- [ ] Audit log: immutability triggers working
- [ ] Database backups verified

## Operational

### Admin Console

- [ ] Admin console functional
- [ ] Admin authentication working
- [ ] Review queue workflow tested
- [ ] Evidence upload + hash display working
- [ ] Report submission flow tested
- [ ] Verification decision flow tested

### Monitoring & Alerting

- [ ] Application monitoring configured
- [ ] Error tracking configured (Sentry/similar)
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set
- [ ] On-call rotation established

### Documentation

- [ ] API documentation complete
- [ ] Incident response runbook documented
- [ ] Rollback procedure documented and tested
- [ ] Deployment runbook documented
- [ ] Support escalation path documented

### Infrastructure

- [ ] Production environment provisioned
- [ ] Database migration scripts tested
- [ ] CDN configured
- [ ] SSL certificates valid
- [ ] DNS configured

## Test Results

### Automated Tests

| Suite | Pass/Fail | Date |
|-------|-----------|------|
| Unit Tests | ⬜ | ___ |
| Integration Tests | ⬜ | ___ |
| E2E Tests | ⬜ | ___ |
| Data Quality | ⬜ | ___ |

### Test Commands

```bash
# Run all tests
npm run test:all

# Individual test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run validate:data
```

## Sign-off

### Required Approvals

- [ ] **Product Lead**: _____________ (signature/date)
- [ ] **Engineering Lead**: _____________ (signature/date)
- [ ] **QA Lead**: _____________ (signature/date)
- [ ] **Legal**: _____________ (signature/date)

### Launch Decision

- [ ] All checklist items complete
- [ ] All sign-offs received
- [ ] **Launch date confirmed**: _____________
- [ ] **Launch time (UTC)**: _____________

## Post-Launch

### Day 1 Verification

- [ ] Site accessible
- [ ] Search functioning
- [ ] Affiliate links working
- [ ] No critical errors in logs
- [ ] Monitoring dashboards green

### Week 1 Tasks

- [ ] Review error rates
- [ ] Review affiliate click data
- [ ] Review user feedback
- [ ] Address any reported issues
- [ ] Post-launch retrospective scheduled
