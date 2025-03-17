import { cookies } from 'next/headers'
import Image from 'next/image'
import { Knowledge } from '@/app/knowledge/components/knowledge'
import { accounts, knowledges } from '@/app/knowledge/data'

export default function KnowledgePage() {
  const layout = cookies().get('react-resizable-panels:layout:knowledge')
  const collapsed = cookies().get('react-resizable-panels:collapsed')

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/knowledge-dark.png"
          width={1280}
          height={727}
          alt="Knowledge"
          className="hidden dark:block"
        />
        <Image
          src="/examples/knowledge-light.png"
          width={1280}
          height={727}
          alt="Knowledge"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Knowledge
          accounts={accounts}
          knowledges={knowledges}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
