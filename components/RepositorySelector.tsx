import RepositoryInput from '@/components/RepositoryInput'
import RepositoryCombobox from '@/components/RepositoryCombobox'

interface RepositorySelectorProps {
  repositories: string[]
  setRepositories: (repositories: string[]) => void
}

export default function RepositorySelector({ repositories, setRepositories }: RepositorySelectorProps) {
  return repositories.length > 0 ? (
    <RepositoryCombobox repositories={repositories} setRepositories={setRepositories} />
  ) : (
    <RepositoryInput setRepositories={setRepositories} />
  )
}
