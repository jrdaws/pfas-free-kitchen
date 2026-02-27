import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'pfas-free-kitchen',
  title: 'PFAS-Free Kitchen',

  projectId: 'v03q4g6v',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Products')
              .child(
                S.list()
                  .title('Products')
                  .items([
                    S.listItem()
                      .title('All Products')
                      .child(S.documentTypeList('product').title('All Products')),
                    S.divider(),
                    S.listItem()
                      .title('Draft Products')
                      .child(
                        S.documentList()
                          .title('Draft Products')
                          .filter('_type == "product" && status == "draft"')
                      ),
                    S.listItem()
                      .title('Ready for Review')
                      .child(
                        S.documentList()
                          .title('Ready for Review')
                          .filter('_type == "product" && status == "review"')
                      ),
                    S.listItem()
                      .title('Published')
                      .child(
                        S.documentList()
                          .title('Published Products')
                          .filter('_type == "product" && status == "published"')
                      ),
                  ])
              ),
            S.listItem()
              .title('Brands')
              .child(S.documentTypeList('brand').title('Brands')),
            S.listItem()
              .title('Categories')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
