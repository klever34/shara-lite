import {IBNPLDrawdown} from '@/models/BNPLDrawdown'
import {useMemo, useState, useCallback} from 'react'

interface UseBNPLDrawdownsOptions {
  bnplDrawdowns: Realm.Results<IBNPLDrawdown & Realm.Object>
}

export const useBNPLDrawdownsList = (options: UseBNPLDrawdownsOptions) => {
  let {bnplDrawdowns: bnplDrawdownsData} = options

  const perPage = 20
  const totalCount = bnplDrawdownsData.length

  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(perPage)
  const [searchTerm, setSearchTerm] = useState('')
  const [bnplDrawdownsToDisplay, setBNPLDrawdownsToDisplay] = useState<
    (IBNPLDrawdown & Realm.Object)[]
  >([])

  const filteredBNPLDrawdowns = useMemo(() => {
    let bnplDrawdowns = (bnplDrawdownsData as unknown) as Realm.Results<
      IBNPLDrawdown & Realm.Object
    >
    if (searchTerm) {
      bnplDrawdowns = bnplDrawdowns.filtered(
        `customer CONTAINS[c] "${searchTerm}"`,
      )
    }
    return bnplDrawdowns.sorted(
      'created_at',
      false,
    )
  }, [bnplDrawdownsData.length, searchTerm])

  const handleSetBNPLDrawdownsToDisplay = useCallback(
    (start, end) => {
      const newData = filteredBNPLDrawdowns.slice(start, end)

      setBNPLDrawdownsToDisplay(bnplDrawdownsToDisplay => {
        return [...bnplDrawdownsToDisplay, ...newData]
      })
    },
    [filteredBNPLDrawdowns],
  )

  const handlePaginatedSearchFilter = useCallback(
    ({
      search,
      endCount,
      startCount,
    }: {
      search?: string
      status?: string
      endCount: number
      startCount: number
    }) => {
      let bnplDrawdowns = (bnplDrawdownsData as unknown) as Realm.Results<
        IBNPLDrawdown & Realm.Object
      >
      if (search) {
        bnplDrawdowns = bnplDrawdowns.filtered(
          `customer.name CONTAINS[c] "${search}"`,
        )
      }
      const newCustomerData = bnplDrawdowns.slice(startCount, endCount)

      setBNPLDrawdownsToDisplay(bnplDrawdownsToDisplay => {
        return [...bnplDrawdownsToDisplay, ...newCustomerData]
      })
    },
    [bnplDrawdownsData.length],
  )

  const handlePagination = useCallback(() => {
    if (totalCount > end) {
      let startCount = start + perPage
      let endCount = end + perPage

      setStart(startCount)
      setEnd(endCount)
      handleSetBNPLDrawdownsToDisplay(startCount, endCount)
    }
  }, [end, start, perPage, totalCount, handleSetBNPLDrawdownsToDisplay])

  const reloadData = useCallback(() => {
    setStart(0)
    setEnd(perPage)
    setBNPLDrawdownsToDisplay([])
    handleSetBNPLDrawdownsToDisplay(0, perPage)
  }, [perPage, handleSetBNPLDrawdownsToDisplay])

  const handleSearch = useCallback(
    (text: string) => {
      setSearchTerm(text)
      setStart(0)
      setEnd(perPage)
      setBNPLDrawdownsToDisplay([])
      handlePaginatedSearchFilter({
        search: text,
        startCount: 0,
        endCount: perPage,
      })
    },
    [handlePaginatedSearchFilter],
  )

  return useMemo(
    () => ({
      searchTerm,
      reloadData,
      handleSearch,
      handlePagination,
      filteredBNPLDrawdowns,
      bnplDrawdownsToDisplay,
    }),
    [
      searchTerm,
      reloadData,
      handleSearch,
      handlePagination,
      filteredBNPLDrawdowns,
      bnplDrawdownsToDisplay,
    ],
  )
}
