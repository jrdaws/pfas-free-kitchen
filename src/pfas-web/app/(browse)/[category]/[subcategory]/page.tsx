import { redirect } from 'next/navigation';

/**
 * Subcategory routes like /appliances/blenders
 * Redirect to parent category (we don't have subcategory product pages yet)
 */
export default function SubcategoryPage({
  params,
}: {
  params: { category: string; subcategory: string };
}) {
  redirect(`/${params.category}`);
}
